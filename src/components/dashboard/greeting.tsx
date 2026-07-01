type GreetingProps = {
  name: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Greeting({ name }: GreetingProps) {
  const firstName = name.split(" ")[0];

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {getGreeting()}, {firstName}.
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Ready to capture your next meeting?
      </p>
    </section>
  );
}
