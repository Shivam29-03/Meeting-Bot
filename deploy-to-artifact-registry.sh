#!/bin/bash

# Meeting Bot Docker deployment script.
# Builds, pushes, and deploys the selected environment to Google Artifact Registry and Cloud Run.

set -e

ENVIRONMENT=${1:-dev}
TAG=${2:-latest}

if [[ ! "$ENVIRONMENT" =~ ^(dev|dev2|pre-prod|prod|clienthf|pv|metawurks-prod)$ ]]; then
  echo "Error: Invalid environment."
  echo "Usage: $0 <dev|dev2|pre-prod|prod|clienthf|pv|metawurks-prod> [tag]"
  exit 1
fi

REGION="us-central1"
IMAGE_NAME="meeting-bot"
MEMORY="2Gi"
CPU="2"
MIN_INSTANCES="0"
MAX_INSTANCES="10"
CONCURRENCY="80"

case "$ENVIRONMENT" in
  dev)
    PROJECT_ID="metawurks-dev-preprod"
    REPOSITORY="dev-meeting-bot"
    SERVICE_NAME="dev-meeting-bot"
    SERVICE_ACCOUNT="dev-meeting-bot@metawurks-dev-preprod.iam.gserviceaccount.com"
    ;;
  dev2)
    PROJECT_ID="metawurks-dev-preprod"
    REPOSITORY="dev2-meeting-bot"
    IMAGE_NAME="dev2-meeting-bot"
    SERVICE_NAME="dev2-meeting-bot"
    SERVICE_ACCOUNT="dev2-meeting-bot@metawurks-dev-preprod.iam.gserviceaccount.com"
    ;;
  pre-prod)
    PROJECT_ID="metawurks-dev-preprod"
    REPOSITORY="pre-prod-meeting-bot"
    SERVICE_NAME="pre-prod-meeting-bot"
    SERVICE_ACCOUNT="pre-prod-meeting-bot@metawurks-dev-preprod.iam.gserviceaccount.com"
    ;;
  prod)
    PROJECT_ID="metawurks"
    REPOSITORY="prod-meeting-bot"
    SERVICE_NAME="prod-meeting-bot"
    SERVICE_ACCOUNT="prod-meeting-bot@metawurks.iam.gserviceaccount.com"
    CONCURRENCY="100"
    ;;
  clienthf)
    PROJECT_ID="metawurks-client1"
    REPOSITORY="chf-meeting-bot"
    SERVICE_NAME="clienthf-meeting-bot"
    SERVICE_ACCOUNT="chf-meeting-bot@metawurks-client1.iam.gserviceaccount.com"
    MAX_INSTANCES="5"
    CONCURRENCY="100"
    ;;
  pv)
    PROJECT_ID="metawurks-private"
    REPOSITORY="pv-meeting-bot"
    SERVICE_NAME="pv-meeting-bot"
    SERVICE_ACCOUNT="pv-meeting-bot@metawurks-private.iam.gserviceaccount.com"
    MAX_INSTANCES="5"
    CONCURRENCY="100"
    ;;
  metawurks-prod)
    PROJECT_ID="metawurks"
    REPOSITORY="prod-meeting-bot"
    SERVICE_NAME="metawurks-prod-meeting-bot"
    SERVICE_ACCOUNT="metawurks-prod-meeting-bot@metawurks.iam.gserviceaccount.com"
    CONCURRENCY="100"
    ;;
esac

ENV_KEY="$(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]' | tr '-' '_')"
NEXTAUTH_URL_VAR="${ENV_KEY}_NEXTAUTH_URL"
NEXT_PUBLIC_API_URL_VAR="${ENV_KEY}_NEXT_PUBLIC_API_URL"
RECALL_REGION_VAR="${ENV_KEY}_RECALL_REGION"

APP_URL="${!NEXTAUTH_URL_VAR}"
PUBLIC_API_URL="${!NEXT_PUBLIC_API_URL_VAR}"
RECALL_REGION="${!RECALL_REGION_VAR:-ap-northeast-1}"

if [ -z "$APP_URL" ] || [ -z "$PUBLIC_API_URL" ]; then
  echo "Error: Set $NEXTAUTH_URL_VAR and $NEXT_PUBLIC_API_URL_VAR before running this script."
  exit 1
fi

ARTIFACT_REGISTRY_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}"

echo "Building and deploying Meeting Bot"
echo "Environment: ${ENVIRONMENT}"
echo "Project: ${PROJECT_ID}"
echo "Repository: ${REPOSITORY}"
echo "Image: ${ARTIFACT_REGISTRY_URL}:${TAG}"

if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running."
  exit 1
fi

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1)"
if [ -z "$ACTIVE_ACCOUNT" ]; then
  echo "Error: gcloud is not authenticated. Run 'gcloud auth login' first."
  exit 1
fi

gcloud auth configure-docker ${REGION}-docker.pkg.dev

docker build \
  --build-arg ENVIRONMENT=${ENVIRONMENT} \
  --build-arg NEXTAUTH_URL="${APP_URL}" \
  --build-arg NEXT_PUBLIC_API_URL="${PUBLIC_API_URL}" \
  --platform linux/amd64 \
  -t ${ARTIFACT_REGISTRY_URL}:${TAG} .

if [ "${TAG}" != "latest" ]; then
  docker tag ${ARTIFACT_REGISTRY_URL}:${TAG} ${ARTIFACT_REGISTRY_URL}:latest
fi

docker push ${ARTIFACT_REGISTRY_URL}:${TAG}

if [ "${TAG}" != "latest" ]; then
  docker push ${ARTIFACT_REGISTRY_URL}:latest
fi

gcloud run deploy ${SERVICE_NAME} \
  --image=${ARTIFACT_REGISTRY_URL}:${TAG} \
  --region=${REGION} \
  --service-account=${SERVICE_ACCOUNT} \
  --memory=${MEMORY} \
  --cpu=${CPU} \
  --min-instances=${MIN_INSTANCES} \
  --max-instances=${MAX_INSTANCES} \
  --concurrency=${CONCURRENCY} \
  --timeout=900 \
  --port=3000 \
  --execution-environment=gen2 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,NEXTAUTH_URL=${APP_URL},NEXT_PUBLIC_API_URL=${PUBLIC_API_URL},RECALL_REGION=${RECALL_REGION}" \
  --update-secrets="NEXTAUTH_SECRET=${ENVIRONMENT}-meeting-bot-nextauth-secret:latest,GOOGLE_CLIENT_ID=${ENVIRONMENT}-meeting-bot-google-client-id:latest,GOOGLE_CLIENT_SECRET=${ENVIRONMENT}-meeting-bot-google-client-secret:latest,MONGODB_URI=${ENVIRONMENT}-meeting-bot-mongodb-uri:latest,RECALL_API=${ENVIRONMENT}-meeting-bot-recall-api:latest,RECALL_WEBHOOK_SECRET=${ENVIRONMENT}-meeting-bot-recall-webhook-secret:latest,OPENAI_API_KEY=${ENVIRONMENT}-meeting-bot-openai-api-key:latest" \
  --quiet

URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
echo "Successfully deployed Meeting Bot"
echo "Service: ${SERVICE_NAME}"
echo "URL: ${URL}"
