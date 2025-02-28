import { useState } from 'react';
import LoadingText from './components/LoadingText';
import OpenAI from 'openai';
import Markdown from 'react-markdown';
import './styles.css'
import rehypeHighlight from 'rehype-highlight';


const openai = new OpenAI({
  apiKey: <api_key_here>,
  dangerouslyAllowBrowser: true
});

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

    setMessages(prev => [...prev, {text: input, sender: 'user', id: Date.now()}])
    const query = input;
    setInput('');

    try {
      setThinking(true);
      const response = await runQuery(query);
      const content = response.choices[0].message.content;
      setMessages(prev => [...prev, {text: content, sender: 'chatgpt', id: Date.now()}])
    } finally {
      setThinking(false);
    }
  }

  const handleClear = () => {
    messages.forEach(message => {
    });
    setMessages([]);
  }

  const runQuery = async (query) => {

    // formats conversation to be accepted by chatgpt api (for conversation state)
    const formatted = messages.sort((a,b) => a.id - b.id).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: [{type: 'text', text: msg.text}],
    }));
    formatted.push({role: 'user', content: query});

    return await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: formatted,
      store: true
    });
  };

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
