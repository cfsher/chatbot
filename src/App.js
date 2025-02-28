import { useState } from 'react';
import LoadingText from './components/LoadingText';
import OpenAI from 'openai';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';


const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

function App() {

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const response = await runQuery(query);
      const content = response.choices[0].message.content;
      setMessages(prev => [...prev, {text: content, sender: 'chatgpt', id: Date.now()}])
    } finally {
      setLoading(false);
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
    <div style={{
        textAlign: 'center',
        margin: '40px 0'
      }}
    >
      <div style={{
          border: "1px solid #ccc",
          height: "400px",
          width: "700px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column-reverse",
          marginLeft: '22%'
        }}
      >
        { loading &&
          <div style={{ margin: '15px 0' }}><LoadingText /></div>
        }
        {
          messages.sort((a,b) => b.id - a.id).map(message => (
            <div style={{
                textAlign: message.sender === 'user' ? 'right' : 'left',
                margin: '15px 5px',
                whiteSpace: 'pre-wrap'
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
            width: '700px'
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
