export function loader() {
  throw new Response("Not found", { status: 404 });
}

export function ErrorBoundary() { return <NotFoundContent />; }

function NotFoundContent() {
  return <main className="not-found"><h1>This branch ends here.</h1><a href="/">Return to the family tree</a></main>;
}

export default function NotFound() { return <NotFoundContent />; }
