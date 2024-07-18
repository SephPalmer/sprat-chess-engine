import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}



function ExampleComponent() {
    const [data, setData] = useState(null);

    useEffect(() => {
        // This is a side effect: fetching data from an API
        fetch('https://reqres.in/api/users')
            .then(response => response.json())
            .then(data => setData(data));
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div>{data ? JSON.stringify(data) : 'Loading...'}</div>
    );
}


interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
}

interface ApiResponse {
    data: User[];
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('https://reqres.in/api/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data: ApiResponse) => {
                setUsers(data.data);
                setLoading(false);
            })
            .catch((error: Error) => {
                setError('Error fetching users: ' + error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {users.map((user: User) => (
                <div key={user.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>{`${user.first_name} ${user.last_name}`}</h2>
                    <img
                        src={user.avatar}
                        alt={`${user.first_name} ${user.last_name}`}
                        style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 0.5rem' }}
                    />
                    <p>{user.email}</p>
                </div>
            ))}
        </div>
    );
};

export default App

export { ExampleComponent }
export {UserList}
