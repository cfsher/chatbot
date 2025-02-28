import { useState } from 'react';
import LoadingText from './components/LoadingText';
import Markdown from 'react-markdown';
import './styles.css'
import rehypeHighlight from 'rehype-highlight';

function App() {

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);

  const inputChange = (value) => {
    setInput(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (input === '') return;

    const arr = [...messages, {text: input, sender: 'user', id: Date.now()}];
    setMessages([...arr])

    const query = input;
    setInput('');

    try {
      setThinking(true);
      const response = await fetch('http://localhost:3005/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({query: query, messages: [...arr]}),
      });
      const json = await response.json();
      setMessages([...arr, {text: json.content, sender: 'chatgpt', id: Date.now()}]);
    } finally {
      setThinking(false);
    }
  }

  const handleClear = () => {
    messages.forEach(message => {
    });
    setMessages([]);
  }

  return (
    <div className='app-container'>

      <div className='chat-box'>
        {
          thinking &&
          <div style={{ margin: '2% 2%' }}><LoadingText /></div>
        }
        {
          messages.sort((a,b) => b.id - a.id).map(message => (
            <div style={{
                textAlign: message.sender === 'user' ? 'right' : 'left',
                margin: '15px 20px',
              }}
            >
              <div style={{ fontWeight: '500' }}>{message.sender === 'user' ? 'you' : 'assistant'}</div>
              <Markdown rehypePlugins={[rehypeHighlight]}>
                {message.text}
              </Markdown>
            </div>
          ))
        }
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          style={{
            width: '200px',
            padding: '5px'
          }}
          placeholder='enter a query..'
          value={input}
          onChange={(e) => inputChange(e.target.value)}
        />
        <button type='submit'>
          submit
        </button>
        <button onClick={() => handleClear()}>
          clear
        </button>
      </form>
    </div>
  );
}

export default App;
