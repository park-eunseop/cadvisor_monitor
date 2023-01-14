var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

let reCad = `docker restart cadvisor `
let checkCmd = `curl http://192.168.1.135:8080/api/v1.3/subcontainers/ | python -m json.tool | jq '.[] | .aliases | select (. != null)?'`;
let restartCmd = `docker start `;
let execContainerArr = [
  'master1',   'master2',
  'worker1',   'worker1-1',
  'worker2',   'worker2-1',
  'worker3',   'worker3-1',
  'cadvisor'
];//실행중인 도커 컨테이너 정보 배열

let flag = false; //컨테이너 재가동 신호
let containerRestartArr = [];  //재시작한 컨테이너

setInterval(()=>{
  exec(reCad,(err,stdout,stderr)=>{})
  setTimeout(() => {
    exec(checkCmd,(err,stdout, stderr)=>{
    
      let containerInfoArr = stdout.split('\n');
      let containerNameArr = [];
      
  
      for(let i=0;i<containerInfoArr.length;i++){
        if(i%4==1){
          containerNameArr.push(containerInfoArr[i].replace(',','').replace(/"/g,'').trim())
        }
      }
      console.log('---------------------------------');
      console.log('현재 실행중인 컨테이너');
      console.log(containerNameArr);
  
  
      //재가동을 하지 않은 경우
      if(!flag){
        if(!execContainerArr.every(item => containerNameArr.includes(item))){
          
          //중단된 컨테이너를 재가동해준다.
          flag = true;//깃발을 든다.
          containerRestartArr = [];   
          execContainerArr.forEach(element => {
            let name = containerNameArr.indexOf(element);
            if(name === -1){
              containerRestartArr.push(element);
              //컨테이너 재시작 명령어
              exec(restartCmd+element.toString(),(err,stdout,stderr)=>{
                //console.log(stdout);
              })
            }
          });    
          console.log('중단된 컨테이너 식별');
          console.log(containerRestartArr);
  
  
  
        } else{
          console.log('중단된 컨테이너가 없습니다.');
        }
      }
    
      else{  //재가동한경우 , 중단된 컨테이너가 켜진경우
  
        if(!containerRestartArr.every(item => containerNameArr.includes(item))){
          console.log('중단된 컨테이너를 재시작 중입니다.');
          console.log(containerRestartArr);
        } else{
          console.log('중단된 컨테이너가 재시작 되었습니다.');
          console.log(containerRestartArr);
          flag = false; //중단된 컨테이너가 재시작 되면 깃발을 내린다.
        }
      }
    })// exec 실행중인 컨테이너 리스트 cadvisor cmd
  }, 3000); //setTimeout
},6000);



module.exports = router;
