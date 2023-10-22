import React, { useState, useEffect } from 'react';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/hello')
            .then(response => response.json())
            .then(data => setMessage(data.message))
            .catch(error => console.error(error));
    }, []);

    return (
        <div className="App">
            <header className="App-header">
            </header>
            <body>
                <div className="message">{message}</div>
            </body>
        </div>
    );
}

export default App;
