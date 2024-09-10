import './App.css';
import React, { useState } from 'react';
import { over } from 'stompjs';
// import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// var stompClient = null;

function App() {
  const [stompClient, setStompClient] = useState(null);
  const [server, setServer] = useState('');
  const [token, setToken] = useState('');
  const [serverResponse, setServerResponse] = useState('');
  const [subscribe, setSubscribe] = useState('');
  const [subscribeResponse, setSubscribeResponse] = useState('');
  const [message, setMessage] = useState('');
  const [messageTo, setMessageTo] = useState('');
  const [allOutput, setAllOutput] = useState([]);
  const [allChannel, setAllChannel]=useState([]);

  const connectServer = (e) => {
    e.preventDefault();

    if (!stompClient) {
      // let Sock=new SockJS(`http://localhost:8080/ws?token=${server}`)
      // const client = over(Sock);
      // setStompClient(client);
      // client.connect({}, onConnected, onError);

      const client = over(new WebSocket(`http://localhost:8080/ws?token=${token}`));
      setStompClient(client);
      
      client.connect({}, onConnected, onError);
    } else {
      stompClient.disconnect(() => {
        setStompClient(null);
        showMessage("Disconnected");
        resetData();
      });
    }
    console.log("stompclient: ", stompClient);
  };

  const onConnected = (res) => {
    console.log("onconnected: ",res);

    setServerResponse(`Server connected successfully: ${server}`);
    showMessage(`Server connected successfully: ${server}`);
  };

  const onError = (error) => {
    console.log("onError: ",error);

    setServerResponse(`Failed to connect to the server: ${error.message}`);
    showMessage(`Connection error: ${error.message}`);
    resetData();
    setStompClient(null);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (stompClient) {
      if (allChannel.includes(subscribe)) {
        console.log("already exists");
        showMessage(`Already exists: ${subscribe}`)
      }
      else{
        stompClient.subscribe(subscribe, onReceivedMessage);
        setSubscribeResponse(`Subscribed successfully to: ${subscribe}`);
        showMessage(`Subscribed successfully to: ${subscribe}`);
        setAllChannel((allChannel) => {  return [...allChannel, subscribe] });
      }
      
    } else {
      showMessage("Please connect to the server first.");
      resetData();
    }
  };

  const onReceivedMessage = (payload) => {
    let payloadData = JSON.parse(payload.body);
    showMessage(`Message received: ${payload.headers.destination} : ${JSON.stringify(payloadData)}`);
  };

  const handleMessage = (e) => {
    e.preventDefault();
    if (stompClient) {
      stompClient.send(messageTo, {}, JSON.stringify(message));
      showMessage(`Message sent to: ${messageTo} : ${message}`);
    } else {
      resetData();
      showMessage("Please connect to the server first.");
    }
  };

  const showMessage = (mes) => {
    console.log(mes);
    setAllOutput((allOutput) => {
      if (allOutput.length > 9) {
        return [...allOutput.slice(1), mes];
      } else {
        return [...allOutput, mes];
      }
    });
  };

  const resetData = () =>{
    setServerResponse('');
    setSubscribeResponse('');
    setAllChannel([]);
  }


  return (
    <>
    <div className='header'>
      <h1>WebSocket API Tester with STOMP and SockJS</h1>
    </div>
    <div className="main-container">
      <div className="left-panel">
        <div className="container">
          <form onSubmit={connectServer} className="input-form">
            <input
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value.trim())}
              placeholder="Connect to Server"
              required
              className="input-field"
            />
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.trim())}
              placeholder="Enter the token if required"
              className="input-field"
            />
            <button type="submit" className="submit-button">
              {stompClient ? "Disconnect" : "Connect"}
            </button>
          </form>
          {serverResponse && <p className="message">Server: {server}</p>}

          <form onSubmit={handleSubscribe} className="input-form">
            <input
              type="text"
              value={subscribe}
              onChange={(e) => setSubscribe(e.target.value.trim())}
              placeholder="Subscribe to Channel"
              required
              className="input-field"
            />
            <button type="submit" className="submit-button">Subscribe</button>
          </form>
          {subscribeResponse && <p className="message">{subscribeResponse}</p>}

          <h2>Subscribed Channels</h2>
          {allChannel && allChannel.map((channel, index) => (
            <div key={index} className="output">
              {channel}
            </div>
          ))}
        </div>
      </div>
      <div className="right-panel">
        <div className='message-section'>
        <form onSubmit={handleMessage} className="input-form">
            <input
              type="text"
              value={messageTo}
              onChange={(e) => setMessageTo(e.target.value.trim())}
              placeholder="Enter Destination to Send Message"
              required
              className="input-field"
            />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter Message"
              required
              className="input-field"
            />
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
        <div className='response'>
          <h1>Responses</h1>
          {allOutput && <button className='submit-button' onClick={() => setAllOutput([])}>Clear All</button>}
        </div>
        {allOutput && allOutput.map((outputItem, index) => (
          <div key={index} className="output">
            {outputItem}
          </div>
        ))}
      </div>
    </div>
    <div className="footer">
      <p>WebSocket API Tester © 2024</p>
    </div>
    </>
  );
}

export default App;
