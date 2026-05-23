import {useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import socket from '../socket/socket';

function Room(){{
  const {id}=useParams();
  const [messages,setMessages]=useState("");
  useEffect(()=>{
    socket.emit('joinRoom',id);
    socket.on('receive-message',(data)=>{
      set
}