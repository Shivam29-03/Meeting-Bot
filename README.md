# Meeting Bot

## Overview
Meeting Bot is a Google Meet recording platform built with Recall.ai.

Users submit a Google Meet URL, a Recall bot joins the meeting, records it, generates a transcript, uploads media to Google Cloud Storage, and provides video playback with speaker-wise transcripts.

## Tech Stack
Next.js 16

App Router

TypeScript

MongoDB Atlas

Mongoose

Recall.ai

Google Cloud Storage

Axios

NextAuth (later)

## Features
src

app

lib

models

types

utils

## Folder Structure


## Environment Variables
MONGO_URI=mongodb+srv://shivamdubey_db_user:VBsw5aefRd5sWkKv@cluster0.6lwwrpu.mongodb.net/
RECALL_API=bb126971582e9c3265166466ee764b8e71999bbb
RECALL_REGION=ap-northeast-1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=PJOEKEcxi6vJroro0bv5sZWJXGtXhkP3Mh5awqgbf4k=

## Database Collections
Meetings
MeetingTranscripts

## API Contract

## Installation
git clone

npm install

cp .env.example .env.local

npm run dev

