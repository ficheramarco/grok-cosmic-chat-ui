export default async function ServerTest() {
    const data = await fetch("https://jsonplaceholder.typicode.com/todos/1").then(
      (res) => res.json()
    );
  
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Server Component</h1>
        <pre className="mt-4 p-4 bg-gray-100 text-black rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }
  