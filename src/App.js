import { useState } from 'react';
import LoadingText from './components/LoadingText';
import OpenAI from 'openai';
import Markdown from 'react-markdown';
import './styles.css'
import rehypeHighlight from 'rehype-highlight';


const openai = new OpenAI({
  apiKey: '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',
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
                margin: '15px 5px',
              }}
            >
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
            width: '250px',
            padding: '5px'
          }}
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
