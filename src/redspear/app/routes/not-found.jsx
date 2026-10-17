import { data } from "react-router";

export function loader() {
  return data(null, { status: 404 });
}

const NotFound = () => {
  return (
    <main>
      <h1>404</h1>
    </main>
  );
};

export default NotFound;
