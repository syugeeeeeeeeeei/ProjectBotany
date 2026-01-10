import{u as tt,a as nt,j as i,C as ar,E as cr,O as lr,d as dr,b as ur,c as En,R as xn,F as yn,S as pr,e as fr,f as rt,g as re,T as De,h as hr,P as gr,t as mr,i as Er}from"./three-utils-CK_vhZ0h.js";import{b as E,d as Sn,p as xr,o as In,_ as It,s as Cn,n as Bt,R as oe}from"./vendor-CY2-48sL.js";import{S as Pt,t as yr,al as Sr,a3 as Ir,am as Cr,an as Tr,ao as Tn,a4 as qe,ap as ae,a2 as ot,aq as Ar,ar as br,as as An,at as Rr,au as vr,D as Or,M as wr}from"./three-core-CRGrrw3S.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const _r=({opacity:e=.3})=>i.jsxs("mesh",{position:[0,-5,0],rotation:[-Math.PI/2,0,0],renderOrder:-1,children:[i.jsx("planeGeometry",{args:[50,50]}),i.jsx("meshBasicMaterial",{color:"#000000",transparent:!0,opacity:e,depthTest:!0,depthWrite:!1})]}),Pr=({image:e})=>{const t=tt(e),n=nt(r=>r.gl);return E.useEffect(()=>{if(t){t.colorSpace=Pt;const r=n.capabilities.getMaxAnisotropy();t.anisotropy=r,t.magFilter=yr,t.minFilter=Sr,t.needsUpdate=!0}},[t,n]),i.jsxs(i.Fragment,{children:[i.jsx("primitive",{attach:"background",object:t}),i.jsx(_r,{opacity:.2})]})},Dr=()=>{const{camera:e}=nt();return E.useEffect(()=>{e.position.set(0,10,0),e.lookAt(0,0,0)},[e]),i.jsx(lr,{makeDefault:!0,enableZoom:!1,enableRotate:!1,enablePan:!1})},Nr=()=>i.jsxs(i.Fragment,{children:[i.jsx(Dr,{}),i.jsx("color",{attach:"background",args:["#1a1a1a"]}),i.jsx("ambientLight",{intensity:.8}),i.jsx("hemisphereLight",{color:"#ffffff",groundColor:"#555555",intensity:1}),i.jsx("directionalLight",{position:[15,25,15],intensity:1,castShadow:!0,"shadow-mapSize":[1024,1024],"shadow-bias":-5e-4,"shadow-camera-left":-30,"shadow-camera-right":30,"shadow-camera-top":30,"shadow-camera-bottom":-30}),i.jsx("directionalLight",{position:[-15,10,-15],intensity:.6}),i.jsx(cr,{preset:"park",blur:3,background:!1}),i.jsx(Pr,{image:"/textures/テーブル3.jpg"})]}),jr=({children:e,uiOverlay:t})=>i.jsxs("div",{style:{width:"100vw",height:"100vh",position:"relative",overflow:"hidden",backgroundColor:"#000"},children:[i.jsx("div",{style:{width:"100%",height:"100%",position:"absolute",zIndex:0},children:i.jsx(ar,{shadows:!0,dpr:[1,2],gl:{antialias:!0,alpha:!1,stencil:!1,depth:!0,powerPreference:"high-performance",precision:"highp"},children:i.jsxs(E.Suspense,{fallback:null,children:[i.jsx(Nr,{}),e]})})}),i.jsx("div",{style:{width:"100%",height:"100%",position:"absolute",zIndex:10,pointerEvents:"none"},children:t})]}),U={initializeField(e,t){const n=[];for(let a=0;a<t;a++){const c=[];for(let l=0;l<e;l++){const p={x:l,y:a,type:"native",ownerId:"native",alienUnitId:void 0};c.push(p)}n.push(c)}const r=e*t,o=10,s=new Set;for(;s.size<o&&s.size<r;){const a=Math.floor(Math.random()*r);s.add(a)}return s.forEach(a=>{const c=a%e,l=Math.floor(a/e),p={x:c,y:l,type:"bare",ownerId:null,alienUnitId:void 0};n[l][c]=p}),{width:e,height:t,cells:n}},isValidCoordinate(e,t){return t.x>=0&&t.x<e.width&&t.y>=0&&t.y<e.height},getCell(e,t){return U.isValidCoordinate(e,t)?e.cells[t.y][t.x]:null},updateCell(e,t){const{x:n,y:r}=t;if(!U.isValidCoordinate(e,{x:n,y:r}))return e;const o=[...e.cells];return o[r]=[...e.cells[r]],o[r][n]=t,{...e,cells:o}},updateCells(e,t){const n=[...e.cells];let r=!1;return t.forEach(o=>{const{x:s,y:a}=o;s>=0&&s<e.width&&a>=0&&a<e.height&&(n[a]===e.cells[a]&&(n[a]=[...e.cells[a]]),n[a][s]=o,r=!0)}),r?{...e,cells:n}:e},countCellsByType(e,t){let n=0;for(const r of e.cells)for(const o of r)(o.type===t||t==="alien"&&o.type==="alien-core")&&n++;return n},getCellsByType(e,t){const n=[];for(let r=0;r<e.height;r++)for(let o=0;o<e.width;o++)e.cells[r][o].type===t?n.push({x:o,y:r}):t==="alien"&&e.cells[r][o].type==="alien-core"&&n.push({x:o,y:r});return n}};function Lr(e){return{all:e=e||new Map,on:function(t,n){var r=e.get(t);r?r.push(n):e.set(t,[n])},off:function(t,n){var r=e.get(t);r&&(n?r.splice(r.indexOf(n)>>>0,1):e.set(t,[]))},emit:function(t,n){var r=e.get(t);r&&r.slice().map(function(o){o(n)}),(r=e.get("*"))&&r.slice().map(function(o){o(t,n)})}}}class Fr{emitter;constructor(){this.emitter=Lr()}emit(t,n){this.emitter.emit(t,n)}on(t,n){this.emitter.on(t,n)}off(t,n){this.emitter.off(t,n)}clear(){this.emitter.all.clear()}}const H=new Fr,$=[];for(let e=0;e<256;++e)$.push((e+256).toString(16).slice(1));function Mr(e,t=0){return($[e[t+0]]+$[e[t+1]]+$[e[t+2]]+$[e[t+3]]+"-"+$[e[t+4]]+$[e[t+5]]+"-"+$[e[t+6]]+$[e[t+7]]+"-"+$[e[t+8]]+$[e[t+9]]+"-"+$[e[t+10]]+$[e[t+11]]+$[e[t+12]]+$[e[t+13]]+$[e[t+14]]+$[e[t+15]]).toLowerCase()}let gt;const kr=new Uint8Array(16);function Gr(){if(!gt){if(typeof crypto>"u"||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");gt=crypto.getRandomValues.bind(crypto)}return gt(kr)}const $r=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),Ht={randomUUID:$r};function Br(e,t,n){e=e||{};const r=e.random??e.rng?.()??Gr();if(r.length<16)throw new Error("Random bytes length must be >= 16");return r[6]=r[6]&15|64,r[8]=r[8]&63|128,Mr(r)}function Ne(e,t,n){return Ht.randomUUID&&!e?Ht.randomUUID():Br(e)}const K=[{id:"alien-1",name:"ナガミヒナゲシ",description:`【拡散】左右1マス
【反撃】なし

特定外来生物ではないが、近年数を増やし侵略性が警戒される。
少し毒があり、あまり警戒されずに徐々に勢力を広げる。`,cost:1,cardType:"alien",deckCount:1,imagePath:"/plants/ナガミヒナゲシ.png",range:{shape:"horizon",scale:1},transition:[{target:"bare",result:"alien-core"}],counterAbility:"none"},{id:"alien-2",name:"ブラジルチドメグサ",description:`【拡散】上下1マス
【反撃】種子散布

特定外来生物。
アクアリウムから逸出し、河川や水路で繁殖する。
茎だけでも増殖し駆除が困難。`,cost:1,cardType:"alien",deckCount:1,imagePath:"/plants/ブラジルチドメグサ.png",range:{shape:"vertical",scale:1},transition:[{target:"bare",result:"alien-core"}],counterAbility:"spread_seed"},{id:"alien-3",name:"オオキンケイギク",description:`【拡散】十字1マス
【反撃】なし

特定外来生物。
観賞用に持ち込まれた。
繁殖・拡散が速い。
道路沿いなどに多く、在来種を駆逐する。`,cost:2,cardType:"alien",deckCount:2,imagePath:"/plants/オオキンケイギク.png",range:{shape:"cross",scale:1},transition:[{target:"bare",result:"alien-core"}],counterAbility:"none",cooldownTurns:1},{id:"alien-4",name:"ミズバショウ",description:`【拡散】周囲1マス
【反撃】なし

諏訪地域では外来植物。
大きな葉で広範囲の面積を奪う。
全国的には希少なため安易に駆除できない。`,cost:3,cardType:"alien",deckCount:2,imagePath:"/plants/ミズバショウ.png",range:{shape:"range",scale:1},transition:[{target:"bare",result:"alien-core"}],counterAbility:"none",cooldownTurns:1},{id:"alien-5",name:"オオハンゴンソウ",description:`【拡散】斜め十字
【反撃】種子散布

特定外来生物。
低木と競合するほど強く、森や山を侵す。
根だけでも増え駆除が困難。`,cost:4,cardType:"alien",deckCount:1,imagePath:"/plants/オオハンゴンソウ.png",range:{shape:"x_cross",scale:2},transition:[{target:"bare",result:"alien-core"}],counterAbility:"spread_seed",usageLimit:3},{id:"alien-6",name:"アレチウリ",description:`【拡散】周囲2マス
【反撃】種子散布

特定外来生物。
つるを伸ばし、樹木や河川敷を覆い尽くす。
密集して繁茂するため、物理的な駆除が難しい。`,cost:5,cardType:"alien",deckCount:1,imagePath:"/plants/アレチウリ.png",range:{shape:"range",scale:2},transition:[{target:"bare",result:"alien-core"}],counterAbility:"spread_seed",cooldownTurns:1,usageLimit:2},{id:"erad-1",name:"刈り払い",description:`【簡易駆除】1マス
草刈り機などで地上部を刈り取る。低コストだが、種子を広げるなど逆効果となる場合がある。`,cost:1,cardType:"eradication",deckCount:1,imagePath:"/actions/erad/kariharai.png",range:{shape:"point",scale:1},transition:[{target:["alien","alien-core"],result:"pioneer"}],eradicationType:"simple"},{id:"erad-2",name:"手取り除草",description:`【簡易駆除】十字範囲
手作業で抜き取る。範囲は広いが、根の断片を残すと再生を許してしまう。`,cost:2,cardType:"eradication",deckCount:1,imagePath:"/actions/erad/tedori.png",range:{shape:"cross",scale:1},transition:[{target:["alien","alien-core"],result:"bare"}],eradicationType:"simple"},{id:"erad-3",name:"遮光シート",description:`【完全駆除】周囲
防草シートで覆い、光合成を阻害して枯死させる。種子の散布を防ぎ、環境負荷も低い`,cost:3,cardType:"eradication",deckCount:2,imagePath:"/actions/erad/shakou.png",cooldownTurns:1,range:{shape:"range",scale:1},transition:[{target:["alien","alien-core"],result:"pioneer"}],eradicationType:"complete"},{id:"erad-4",name:"表土掘削・搬出",description:`【完全駆除】周囲
種子を含んだ表土ごと重機で削り取り、搬出する。広範囲を安全に浄化する。`,cost:4,cardType:"eradication",deckCount:1,imagePath:"/actions/erad/kussaku.png",range:{shape:"x_cross",scale:2},transition:[{target:["alien","alien-core"],result:"bare"}],eradicationType:"complete",usageLimit:2},{id:"erad-5",name:"抜本的駆除計画",description:`【連鎖駆除】
あらゆる手段・莫大なコストを投じ、指定した外来種を根こそぎ駆除する最終手段。`,cost:5,cardType:"eradication",deckCount:1,imagePath:"/actions/erad/bappon.png",range:{shape:"point",scale:1},transition:[{target:"alien-core",result:"bare"}],eradicationType:"chain",cooldownTurns:1,usageLimit:2},{id:"recov-1",name:"客土（土入れ）",description:`【回復】範囲1マス (裸地→先駆植生)
外来種の種を含まない清浄な土を入れる。裸地を塞ぎ、在来種が定着できる土台を作る`,cost:1,cardType:"recovery",deckCount:1,imagePath:"/actions/recov/kyakudo.png",range:{shape:"cross",scale:1},transition:[{target:"bare",result:"pioneer"}],protection:"none"},{id:"recov-2",name:"在来種植栽",description:`【回復】範囲1マス (先駆植生→在来)
在来種の苗を直接植え付ける。時間をかけずに緑を取り戻すことができる。`,cost:2,cardType:"recovery",deckCount:1,imagePath:"/actions/recov/shokusai.png",range:{shape:"range",scale:1},transition:[{target:"pioneer",result:"native"}],protection:"none"},{id:"recov-3",name:"河川環境管理",description:`【回復】縦一列 (裸地→先駆植生)
川の流れに沿って環境を整え、外来種の侵入しにくい自然な水辺を再生する。`,cost:3,cardType:"recovery",deckCount:1,imagePath:"/actions/recov/kasen.png",range:{shape:"vertical",scale:2},transition:[{target:"bare",result:"pioneer"}],protection:"none",usageLimit:2},{id:"recov-4",name:"大地の恵み",description:`【回復】周囲 (先駆→在来)
生態系本来の回復力を呼び覚ます。広範囲の先駆植生が一斉に在来種へ遷移する。`,cost:4,cardType:"recovery",deckCount:1,imagePath:"/actions/recov/megumi.png",range:{shape:"range",scale:2},transition:[{target:"bare",result:"pioneer"},{target:"pioneer",result:"native"}],protection:"none",usageLimit:2}],Q={FIELD_WIDTH:7,FIELD_HEIGHT:10,MAXIMUM_ROUNDS:6,INITIAL_ENVIRONMENT:1},F=Sn()(dr(e=>({currentRound:1,maximumRounds:Q.MAXIMUM_ROUNDS,activePlayerId:"alien",currentPhase:"start",isGameOver:!1,winningPlayerId:null,nativeScore:0,alienScore:0,history:[],gameField:{width:Q.FIELD_WIDTH,height:Q.FIELD_HEIGHT,cells:[]},alienInstances:{},playerStates:{native:He("native","在来種"),alien:He("alien","外来種")},initializeGame:()=>{const t=U.initializeField(Q.FIELD_WIDTH,Q.FIELD_HEIGHT),n=He("native","在来種"),r=He("alien","外来種"),o=U.countCellsByType(t,"native"),s=U.countCellsByType(t,"alien");e({currentRound:1,activePlayerId:"alien",currentPhase:"start",isGameOver:!1,winningPlayerId:null,nativeScore:o,alienScore:s,history:[],gameField:t,alienInstances:{},playerStates:{native:n,alien:r}})},setState:t=>e(n=>({...n,...t}))})));function He(e,t){const n=[];return K.forEach(r=>{const o=r.cardType==="alien";if(e==="alien"?o:!o)for(let a=0;a<r.deckCount;a++)n.push({instanceId:Ne(),cardDefinitionId:r.id})}),{playerId:e,playerName:t,facingFactor:e==="alien"?1:-1,initialEnvironment:Q.INITIAL_ENVIRONMENT,currentEnvironment:Q.INITIAL_ENVIRONMENT,maxEnvironment:Q.INITIAL_ENVIRONMENT,cardLibrary:n,cooldownActiveCards:[],limitedCardsUsedCount:{}}}const bn={startRound(e){const{currentRound:t,playerStates:n,gameField:r}=e,o=t+1,s={...n};Object.keys(s).forEach(d=>{const u=d,h=s[u],f=Math.min(o,e.maximumRounds),m=h.cooldownActiveCards.map(x=>({...x,roundsRemaining:x.roundsRemaining-1})).filter(x=>x.roundsRemaining>0);s[u]={...h,maxEnvironment:f,currentEnvironment:f,cooldownActiveCards:m}});const a=[];for(let d=0;d<r.height;d++)for(let u=0;u<r.width;u++){const h=r.cells[d][u];h.type==="pioneer"&&a.push({...h,type:"native",ownerId:"native"})}const c=U.updateCells(r,a),l=U.countCellsByType(c,"native"),p=U.countCellsByType(c,"alien");return H.emit("ROUND_START",{round:o}),{...e,currentRound:o,currentPhase:"start",activePlayerId:"alien",playerStates:s,gameField:c,nativeScore:l,alienScore:p}},endRoundProcess(e){console.log(`🏁 Ending Round ${e.currentRound}...`),H.emit("ROUND_END",{round:e.currentRound});const t=F.getState();if(t.currentRound>=t.maximumRounds){console.log("🏆 Game Over: Maximum rounds reached.");const r=U.countCellsByType(t.gameField,"native"),o=U.countCellsByType(t.gameField,"alien");let s=null;r>o?s="native":o>r&&(s="alien"),F.getState().setState({isGameOver:!0,winningPlayerId:s,nativeScore:r,alienScore:o,currentPhase:"end"});return}const n=bn.startRound(t);F.getState().setState(n),console.log(`⏭️ Transitioned to Round ${n.currentRound}`)}},Hr={nextTurn(e){const{activePlayerId:t}=e;if(H.emit("PLAYER_ACTION_END",{playerId:t}),t==="alien"){const n={...e,activePlayerId:"native"};return H.emit("PLAYER_ACTION_START",{playerId:"native"}),n}else return{...e,currentPhase:"end"}}},Ur=e=>(t,n,r)=>(r.setState=(o,s,...a)=>{const c=typeof o=="function"?xr(o):o;return t(c,s,...a)},e(r.setState,n,r)),zr=Ur,O=Sn(zr(e=>({selectedCell:null,hoveredCell:null,selectedCardId:null,isHoverValid:!1,notifications:[],isCardPreview:!1,isInteractionLocked:!1,debugSettings:{showGestureArea:!1,showFps:!1},selectCell:t=>e(n=>{n.selectedCell=t}),hoverCell:t=>e(n=>{n.hoveredCell=t,t===null&&(n.isHoverValid=!1)}),selectCard:t=>e(n=>{n.selectedCardId=t,n.selectedCell=null,n.isHoverValid=!1}),setHoverValid:t=>e(n=>{n.isHoverValid=t}),pushNotification:(t,n="info",r)=>e(o=>{const s={id:Ne(),message:t,type:n,player:r,timestamp:Date.now()};o.notifications=[s,...o.notifications].slice(0,3)}),removeNotification:t=>e(n=>{n.notifications=n.notifications.filter(r=>r.id!==t)}),clearNotifications:()=>e(t=>{t.notifications=[]}),setCardPreview:t=>e(n=>{n.isCardPreview=t}),setInteractionLock:t=>e(n=>{n.isInteractionLocked=t}),deselectCard:()=>e(t=>{t.selectedCardId=null,t.selectedCell=null,t.isCardPreview=!1,t.isHoverValid=!1}),updateDebugSettings:t=>e(n=>{n.debugSettings={...n.debugSettings,...t}})}))),Xr=3e3;class we{static timers=new Map;static notify(t,n="info",r){const o=Ne();O.getState().pushNotification(t,n,r),this.scheduleRemoval(o,Xr)}static remove(t){this.timers.has(t)&&(clearTimeout(this.timers.get(t)),this.timers.delete(t)),O.getState().removeNotification(t)}static scheduleRemoval(t,n){this.timers.has(t)&&clearTimeout(this.timers.get(t));const r=setTimeout(()=>{this.remove(t)},n);this.timers.set(t,r)}}In({x:Bt(),y:Bt(),type:It(["native","alien","bare","pioneer"])});const Yr=In({message:Cn(),type:It(["info","error","success","system"]).optional(),player:It(["native","alien"]).optional()}),Wr=Cn().uuid(),B={system:{reset:()=>{F.getState().initializeGame()},updateState:e=>{F.getState().setState(e)}},turn:{end:()=>{const e=F.getState(),t=Hr.nextTurn(e);F.getState().setState(t),t.currentPhase==="end"&&bn.endRoundProcess(t)}},ui:{selectCard:e=>{Wr.parse(e),O.getState().selectCard(e)},deselectCard:()=>O.getState().deselectCard(),hoverCell:e=>O.getState().hoverCell(e),updateDebugSettings:e=>O.getState().updateDebugSettings(e),notify:e=>{const{message:t,type:n,player:r}=Yr.parse(e);we.notify(t,n,r)}}},Vr=()=>{console.log("🚀 Initializing Core-Feature Architecture..."),B.system.reset(),console.log("✅ Initialization Complete.")},P={useGameState:()=>F(e=>e),useCurrentRound:()=>F(e=>e.currentRound),useActivePlayer:()=>F(e=>e.activePlayerId),usePlayer:e=>F(t=>t.playerStates[e]),useField:()=>F(e=>e.gameField),useCell:(e,t)=>F(n=>n.gameField.cells[t]?.[e]),useScore:e=>F(t=>e==="native"?t.nativeScore:t.alienScore),useActiveAliens:()=>F(e=>e.alienInstances),ui:{useSelectedCardId:()=>O(e=>e.selectedCardId),useSelectedCell:()=>O(e=>e.selectedCell),useIsInteractionLocked:()=>O(e=>e.isInteractionLocked),useNotification:()=>O(e=>e.notifications),useDebugSettings:()=>O(e=>e.debugSettings)}},k={BOARD:{CELL_GAP:1,CELL_SIZE:.9},COLORS:{NATIVE_AREA:"#236026",ALIEN_INVASION:"#c24141",EMPTY:"#5d5d5d",RECOVERY_PENDING:"#4cd100",DEFAULT_CELL:"#444444",EMISSIVE_DEFAULT:"black",CARD_TYPES:{ALIEN:"#A00000",ERADICATION:"#005080",RECOVERY:"#207030",DEFAULT:"#555555"},CARD_UI:{BORDER_DEFAULT:"#B8860B",BORDER_HOVER:"#FAD02C",BORDER_SELECTED:"#FFD700",BASE_BG:"#e8e6dd",TEXT_WHITE:"#FFFFFF",TEXT_BLACK:"#000000",DESC_BG:"#FFFFFF"}}},Zr=0,Kr=e=>{const t=O(m=>m.selectedCell?.x===e.x&&m.selectedCell?.y===e.y),n=O(m=>m.hoveredCell?.x===e.x&&m.hoveredCell?.y===e.y),r=O(m=>m.selectedCardId),o=P.useActivePlayer(),s=P.usePlayer(o),a=E.useRef(null),c=E.useMemo(()=>{if(!r||!s)return null;const m=s.cardLibrary.find(x=>x.instanceId===r);return m?K.find(x=>x.id===m.cardDefinitionId):K.find(x=>x.id===r)},[r,s]);E.useEffect(()=>()=>{a.current&&clearTimeout(a.current)},[]);const l=E.useMemo(()=>{switch(e.type){case"native":return k.COLORS.NATIVE_AREA;case"alien":return k.COLORS.ALIEN_INVASION;case"pioneer":return k.COLORS.RECOVERY_PENDING;case"bare":return k.COLORS.EMPTY;default:return k.COLORS.DEFAULT_CELL}},[e.type]),p=E.useMemo(()=>t?"#ffffff":n?"#666666":k.COLORS.EMISSIVE_DEFAULT,[t,n]),d=t||n?.5:0,u=E.useCallback(m=>{m.stopPropagation(),O.getState().hoverCell(e),O.getState().setHoverValid(!1),r&&(a.current&&clearTimeout(a.current),a.current=setTimeout(()=>{O.getState().setHoverValid(!0)},Zr))},[e,r]),h=E.useCallback(()=>{a.current&&clearTimeout(a.current),O.getState().hoverCell(null),O.getState().setHoverValid(!1)},[]),f=E.useCallback(m=>{if(m.stopPropagation(),!r){O.getState().selectCell(null);return}if(O.getState().isHoverValid){if(c){let x=!0,y="";if(c.cardType==="alien"&&e.type!=="bare"&&(x=!1,y="外来種は「裸地」にしか配置できません"),!x){B.ui.notify({message:y,type:"error"});return}}H.emit("CELL_CLICK",{cell:e}),a.current&&clearTimeout(a.current),O.getState().setHoverValid(!1)}},[e,r,c]);return{isSelected:t,isHovered:n,styles:{cellColor:l,emissiveColor:p,emissiveIntensity:d},handlers:{handlePointerOver:u,handlePointerOut:h,handleClick:f}}},qr=({cell:e})=>{const{styles:t,handlers:n}=Kr(e),r=E.useRef(null),[o,s]=E.useState(!1),a=(e.x-6/2)*k.BOARD.CELL_GAP,c=(e.y-9/2)*k.BOARD.CELL_GAP;ur(o),En((d,u)=>{if(!r.current)return;const h=o?.1:0;if(Math.abs(r.current.position.y-h)<.001){r.current.position.y!==h&&(r.current.position.y=h);return}r.current.position.y=Ir.lerp(r.current.position.y,h,u*10)});const l=d=>{d.stopPropagation(),s(!0),n.handlePointerOver(d)},p=()=>{s(!1)};return i.jsx("group",{ref:r,position:[a,0,c],children:i.jsx(xn,{args:[k.BOARD.CELL_SIZE,.1,k.BOARD.CELL_SIZE],radius:.05,smoothness:1,creaseAngle:.4,onPointerOver:l,onPointerOut:p,onPointerUp:n.handleClick,receiveShadow:!0,castShadow:!0,children:i.jsx("meshStandardMaterial",{color:t.cellColor,emissive:t.emissiveColor,emissiveIntensity:t.emissiveIntensity+(o?.5:0),roughness:.4,metalness:.1})})})},Jr=new Cr(1,32,32),Qr=new Tr(.7,.08,16,48),Ut=new Tn(.7,32),eo=new Tn(.12,32),to=({x:e,y:t,imageUrl:n="https://placehold.co/256x160/ccc/999?text=Loading",isPreview:r=!1,isReady:o=!1})=>{const s=(e-3)*k.BOARD.CELL_GAP,a=(t-9/2)*k.BOARD.CELL_GAP,c=r?o?.9:.3:1;return i.jsxs("group",{position:[s,.4,a],children:[i.jsx(yn,{speed:8,rotationIntensity:.3,floatIntensity:1,children:i.jsx(no,{imageUrl:n,scale:.3,opacity:c})}),i.jsx("mesh",{position:[0,-.2,0],rotation:[-Math.PI/2,0,0],geometry:eo,children:i.jsx("meshBasicMaterial",{color:"#000000",transparent:!0,opacity:.2*c})})]})};function no({imageUrl:e,scale:t=1,opacity:n=1}){const r=tt(e);E.useMemo(()=>{r.colorSpace=Pt,r.anisotropy=4,r.center.set(.5,.5),r.wrapS=qe,r.wrapT=qe},[r]);const o=E.useMemo(()=>{const s={transparent:n<1,opacity:n},a=new ae({color:13214285,metalness:.9,roughness:.25,...s}),c=new ae({color:7032366,metalness:.65,roughness:.4,...s}),l=new ae({color:65407,metalness:.65,roughness:.4,...s}),p=new ae({color:2826518,metalness:.25,roughness:.65,...s});return{gold:a,bronze:c,dark:p,liteGreen:l}},[n]);return i.jsxs("group",{scale:t,children:[i.jsx("mesh",{geometry:Jr,material:o.liteGreen}),i.jsxs("group",{position:[0,1,0],rotation:[-Math.PI/2,0,0],children:[i.jsx("mesh",{geometry:Qr,material:o.gold}),i.jsx("mesh",{position:[0,0,-.02],geometry:Ut,material:o.dark}),i.jsx("mesh",{position:[0,0,.05],geometry:Ut,children:i.jsx("meshStandardMaterial",{map:r,transparent:n<1,opacity:n,roughness:.5,emissive:"white",emissiveIntensity:.01})})]})]})}const ue=new ot;ue.moveTo(-1.2,-1.3);ue.quadraticCurveTo(0,-1.9,1.2,-1.3);ue.lineTo(1.4,1.2);ue.quadraticCurveTo(0,2,-1.4,1.2);ue.closePath();const Se=new Ar;Se.moveTo(-1.05,-1.15);Se.quadraticCurveTo(0,-1.65,1.05,-1.15);Se.lineTo(1.25,1.05);Se.quadraticCurveTo(0,1.75,-1.25,1.05);Se.closePath();ue.holes.push(Se);const Ie=new ot;Ie.moveTo(-1.05,-1.15);Ie.quadraticCurveTo(0,-1.65,1.05,-1.15);Ie.lineTo(1.25,1.05);Ie.quadraticCurveTo(0,1.75,-1.25,1.05);Ie.closePath();const ro=new br(ue,{depth:.2,bevelEnabled:!0,bevelThickness:.05,bevelSize:.05,bevelSegments:6,curveSegments:24}),oo=new An(1.15,1.15,.1,48),so=new An(1.1,1.1,.02,48),Re=new Rr(Ie,24);{Re.computeBoundingBox();const e=Re.boundingBox,t=e.max.x-e.min.x,n=e.max.y-e.min.y,r=Re.attributes.uv,o=Re.attributes.position;for(let s=0;s<o.count;s++){const a=o.getX(s),c=o.getY(s),l=1-(a-e.min.x)/t,p=1-(c-e.min.y)/n;r.setXY(s,l,p)}r.needsUpdate=!0}const Rn=({x:e,y:t,status:n,cardDefinitionId:r,isPreview:o=!1,isReady:s=!1})=>{const a=(e-3)*k.BOARD.CELL_GAP,c=(t-9/2)*k.BOARD.CELL_GAP,l=o?s?.9:.3:1,d=E.useMemo(()=>K.find(u=>u.id===r),[r])?.imagePath||"https://placehold.co/256x160/ccc/999?text=Loading";return n==="seed"?i.jsx(to,{x:e,y:t,imageUrl:d,isPreview:o,isReady:s}):i.jsx("group",{position:[a,.15,c],children:i.jsxs(yn,{speed:4,rotationIntensity:.1,floatIntensity:.5,children:[i.jsx(io,{imageUrl:d,scale:.3,rotation:[-Math.PI/2,0,Math.PI],opacity:l}),i.jsx(pr,{count:4,scale:1.2,size:6,speed:.4,opacity:.4,color:"#E1BEE7",position:[0,0,0]})]})})};function io({imageUrl:e,position:t=[0,0,0],rotation:n=[0,0,0],scale:r=1,opacity:o=1}){const s=tt(e);E.useMemo(()=>{s.colorSpace=Pt,s.anisotropy=4,s.wrapS=qe,s.wrapT=qe},[s]);const a=E.useMemo(()=>{const c=new ae({color:13214285,metalness:.9,roughness:.25,transparent:o<1,opacity:o}),l=new ae({color:7032366,metalness:.65,roughness:.4,transparent:o<1,opacity:o}),p=new ae({color:2826518,metalness:.25,roughness:.65,transparent:o<1,opacity:o});return{gold:c,bronze:l,dark:p}},[o]);return i.jsxs("group",{position:t,rotation:n,scale:r,children:[i.jsx("mesh",{geometry:ro,material:a.gold}),i.jsx("mesh",{geometry:oo,material:a.bronze,rotation:[Math.PI/2,0,0],position:[0,0,-.05]}),i.jsx("mesh",{geometry:so,material:a.dark,rotation:[Math.PI/2,0,0],position:[0,0,.02]}),i.jsx("mesh",{position:[0,0,.21],geometry:Re,children:i.jsx("meshStandardMaterial",{map:s,transparent:!0,alphaTest:.5,roughness:.5,emissive:"white",emissiveIntensity:.01})})]})}const G={getCell:U.getCell,updateCell:U.updateCell,updateCells:U.updateCells,initializeField:U.initializeField,getCellsByType:U.getCellsByType},ao=(e,t,n)=>{console.group(`[PlayCard] 🃏 Action: ${t.name} (ID: ${t.id})`),console.log(`Target: [x:${n.x}, y:${n.y}]`);let r=e;switch(t.cardType){case"alien":r=co(e,t,n);break;case"eradication":r=lo(e,t,n);break;case"recovery":r=uo(e,t,n);break;default:console.warn("[PlayCard] ⚠️ Unknown card type");break}return console.groupEnd(),r},Ct=(e,t)=>e.find(n=>(Array.isArray(n.target)?n.target:[n.target]).includes(t)),Dt=e=>{const t=[];return e.forEach(n=>{const r=Array.isArray(n.target)?n.target:[n.target];t.push(...r)}),Array.from(new Set(t))},co=(e,t,n)=>{const{gameField:r,alienInstances:o,currentRound:s}=e,a=G.getCell(r,n);if(!a)return e;const c=Dt(t.transition);if(!c.includes(a.type)){const u=`そこには配置できません。（対象: ${c.join(", ")}）`;return console.warn(`[PlayCard] ❌ ${u}`),we.notify(u,"error"),e}const l=Ne(),p={instanceId:l,cardDefinitionId:t.id,spawnedRound:s,status:"seed",currentX:n.x,currentY:n.y},d={...a,type:"alien-core",ownerId:"alien",alienUnitId:l};return console.info(`[PlayCard] ✅ Success: Placed Seed (Core) at [${n.x}, ${n.y}]`),{...e,gameField:G.updateCell(r,d),alienInstances:{...o,[l]:p}}},lo=(e,t,n)=>{const{range:r,eradicationType:o,preventsCounter:s,transition:a}=t;let c={...e},l=0,p=0;const d=G.getCell(c.gameField,n);if(!d)return e;if(o==="chain"){if(d.type!=="alien-core"){const h="連鎖駆除は「外来種(Core)」を指定してください。";return console.warn(`[PlayCard] ❌ ${h}`),we.notify(h,"error"),e}}else if(!Dt(a).includes(d.type)){const f="無効なターゲットです。";return console.warn(`[PlayCard] ❌ ${f}`),we.notify(f,"error"),e}let u=[];return o==="chain"?d&&d.alienUnitId&&(u=G.getCellsByType(c.gameField,"alien").concat(G.getCellsByType(c.gameField,"alien-core")).filter(h=>G.getCell(c.gameField,h)?.alienUnitId===d.alienUnitId),console.log(`[PlayCard] ⛓️ Chain Destruction selected: ${u.length} cells linked to ID ${d.alienUnitId}`)):u=st(c.gameField.width,c.gameField.height,n,r.shape,r.scale),u.forEach(h=>{const f=G.getCell(c.gameField,h);if(!f)return;if(f.type==="alien"||f.type==="alien-core"){const y=f.alienUnitId;if(y){const I=c.alienInstances[y],b=f.type==="alien-core",C=o==="simple";if(b&&I){const D=fo(I.cardDefinitionId)?.counterAbility==="spread_seed";C&&!s&&D&&(console.warn(`[PlayCard] ⚠️ Counter Ability Triggered at [${h.x}, ${h.y}]!`),c=po(c,h,I.cardDefinitionId));const v={...c.alienInstances};delete v[y],c.alienInstances=v,l++}else f.type==="alien"&&l++}}let x=null;if(o==="chain"&&(f.type==="alien"||f.type==="alien-core")){const y=Ct(a,"alien-core");y&&(x=y.result)}else{const y=Ct(a,f.type);y&&(x=y.result)}if(x){const y={...f,type:x,ownerId:null,alienUnitId:void 0};c.gameField=G.updateCell(c.gameField,y),p++}}),console.info(`[PlayCard] ✅ Success: Removed ${l} alien units, Affected ${p} cells.`),c},uo=(e,t,n)=>{const{range:r,transition:o}=t,s={...e};let a=0;const c=G.getCell(s.gameField,n);return c?Dt(o).includes(c.type)?(st(s.gameField.width,s.gameField.height,n,r.shape,r.scale).forEach(d=>{const u=G.getCell(s.gameField,d);if(!u)return;const h=Ct(o,u.type);if(h){const f=h.result;let m=u.ownerId;if(f==="native"?m="native":f==="pioneer"&&(m=null),f!==u.type){const x={...u,type:f,ownerId:m};s.gameField=G.updateCell(s.gameField,x),a++}}}),console.info(`[PlayCard] ✅ Success: Recovered ${a} cells.`),s):(we.notify("無効なターゲットです。","error"),e):e},po=(e,t,n)=>{const r={...e},{gameField:o}=r,a=st(o.width,o.height,t,"range",1).filter(d=>G.getCell(o,d)?.type==="bare"),c=Math.min(a.length,2);if(c===0)return r;const p=a.sort(()=>.5-Math.random()).slice(0,c);return console.log(`[Counter] Spawning ${c} seeds around [${t.x}, ${t.y}] from ${n}`),p.forEach(d=>{const u=Ne(),h={instanceId:u,cardDefinitionId:n,spawnedRound:r.currentRound,status:"seed",currentX:d.x,currentY:d.y},m={...G.getCell(r.gameField,d),type:"alien-core",ownerId:"alien",alienUnitId:u};r.gameField=G.updateCell(r.gameField,m),r.alienInstances={...r.alienInstances,[u]:h}}),r},st=(e,t,n,r,o=1)=>{const s=[],{x:a,y:c}=n,l=(d,u)=>{d>=0&&d<e&&u>=0&&u<t&&s.push({x:d,y:u})};for(let d=1;d<=o;d++)switch(r){case"point":d===1&&l(a,c);break;case"vertical":l(a,c),l(a,c-d),l(a,c+d);break;case"horizon":l(a,c),l(a-d,c),l(a+d,c);break;case"cross":d===1&&l(a,c),l(a,c-d),l(a,c+d),l(a-d,c),l(a+d,c);break;case"x_cross":d===1&&l(a,c),l(a-d,c-d),l(a+d,c-d),l(a-d,c+d),l(a+d,c+d);break;case"range":for(let u=-d;u<=d;u++)for(let h=-d;h<=d;h++)(Math.abs(h)===d||Math.abs(u)===d)&&l(a+h,c+u);break}return r==="point"&&s.length===0&&l(a,c),Array.from(new Set(s.map(d=>`${d.x},${d.y}`))).map(d=>{const[u,h]=d.split(",").map(Number);return{x:u,y:h}})},fo=e=>K.find(t=>t.id===e&&t.cardType==="alien"),ho=()=>{const e=O(u=>u.hoveredCell),t=O(u=>u.selectedCardId),n=P.useField(),r=P.useActivePlayer(),o=P.usePlayer(r),s=E.useMemo(()=>{if(!t)return null;if(o){const h=o.cardLibrary.find(f=>f.instanceId===t);if(h)return K.find(f=>f.id===h.cardDefinitionId)??null}const u=K.find(h=>h.id===t);return u||null},[t,o]);E.useEffect(()=>{t&&!s&&console.warn(`[PlacementGuide] Card ID '${t}' not found.`)},[t,s]);const a=(u,h,f,m)=>{const x=m.cells[h]?.[u];if(!x)return!1;const y=[];return f.transition.forEach(I=>{const b=Array.isArray(I.target)?I.target:[I.target];y.push(...b)}),y.includes(x.type)},c=E.useMemo(()=>{if(!s||!n)return[];const u=[];for(let h=0;h<n.height;h++)for(let f=0;f<n.width;f++){const m=a(f,h,s,n);u.push({x:f,y:h,isValid:m})}return u},[s,n]),l=E.useMemo(()=>{if(!e||!s||!n)return[];if(s.cardType==="eradication"&&s.eradicationType==="chain"){const f=G.getCell(n,e);if(f&&f.type==="alien-core"&&f.alienUnitId)return[...G.getCellsByType(n,"alien"),...G.getCellsByType(n,"alien-core")].filter(x=>G.getCell(n,x)?.alienUnitId===f.alienUnitId)}const{shape:u,scale:h}=s.range;return st(n.width,n.height,{x:e.x,y:e.y},u,h)},[e,s,n]),p=E.useMemo(()=>!e||!s?null:{x:e.x,y:e.y},[e,s]);return{allCellGuides:c,effectRange:l,previewPosition:p,selectedCard:s,getPosition:(u,h,f=.05)=>{const m=(u-3)*k.BOARD.CELL_GAP,x=(h-9/2)*k.BOARD.CELL_GAP;return[m,f,x]},isVisible:!!(s&&n)}},j=new vr,go=()=>{const{allCellGuides:e,effectRange:t,previewPosition:n,selectedCard:r,getPosition:o,isVisible:s}=ho(),a=O(m=>m.isHoverValid),{validGuides:c,invalidGuides:l}=E.useMemo(()=>{const m=[],x=[];for(const y of e)y.isValid?m.push(y):x.push(y);return{validGuides:m,invalidGuides:x}},[e]),p=E.useRef(null),d=E.useRef(null),u=E.useRef(null),h=E.useRef(null);if(E.useLayoutEffect(()=>{if(p.current&&c.length>0){const m=p.current;c.forEach((x,y)=>{const[I,b,C]=o(x.x,x.y,.02);j.position.set(I,b,C),j.rotation.set(-Math.PI/2,0,0),j.scale.set(1,1,1),j.updateMatrix(),m.setMatrixAt(y,j.matrix)}),m.instanceMatrix.needsUpdate=!0}if(d.current&&l.length>0){const m=d.current;l.forEach((x,y)=>{const[I,b,C]=o(x.x,x.y,.02);j.position.set(I,b,C),j.rotation.set(-Math.PI/2,0,Math.PI/4),j.scale.set(1,1,1),j.updateMatrix(),m.setMatrixAt(y*2,j.matrix),j.rotation.set(-Math.PI/2,0,-Math.PI/4),j.updateMatrix(),m.setMatrixAt(y*2+1,j.matrix)}),m.instanceMatrix.needsUpdate=!0}if(u.current&&h.current&&t.length>0){const m=u.current,x=h.current;t.forEach((y,I)=>{const[b,C,S]=o(y.x,y.y,.03);j.position.set(b,C,S),j.rotation.set(-Math.PI/2,0,0),j.scale.set(1,1,1),j.updateMatrix(),m.setMatrixAt(I,j.matrix),j.position.set(b,C+.01,S),j.updateMatrix(),x.setMatrixAt(I,j.matrix)}),m.instanceMatrix.needsUpdate=!0,x.instanceMatrix.needsUpdate=!0}},[c,l,t,o]),!s)return null;const f=a?.7:.3;return i.jsxs("group",{name:"guide-layer",children:[c.length>0&&i.jsxs("instancedMesh",{ref:p,args:[void 0,void 0,c.length],raycast:()=>null,children:[i.jsx("ringGeometry",{args:[.4,.45,4],rotateZ:Math.PI/4}),i.jsx("meshBasicMaterial",{color:"#00FFFF",opacity:.5,transparent:!0,side:Or})]}),l.length>0&&i.jsxs("instancedMesh",{ref:d,args:[void 0,void 0,l.length*2],raycast:()=>null,children:[i.jsx("planeGeometry",{args:[.7,.08]}),i.jsx("meshBasicMaterial",{color:"#FF3333",opacity:.5,transparent:!0})]}),t.length>0&&i.jsxs(i.Fragment,{children:[i.jsxs("instancedMesh",{ref:u,args:[void 0,void 0,t.length],raycast:()=>null,children:[i.jsx("planeGeometry",{args:[.8,.8]}),i.jsx("meshBasicMaterial",{color:"#00FFFF",opacity:f,transparent:!0})]}),i.jsxs("instancedMesh",{ref:h,args:[void 0,void 0,t.length],raycast:()=>null,children:[i.jsx("ringGeometry",{args:[.38,.42,32]}),i.jsx("meshBasicMaterial",{color:"#00FFFF",opacity:.8,transparent:!0})]})]}),n&&r?.cardType==="alien"&&i.jsx("group",{name:"preview-token",children:i.jsx(Rn,{x:n.x,y:n.y,status:"seed",isPreview:!0,isReady:a})})]})},mo=({width:e,height:t,thickness:n,...r})=>i.jsxs("mesh",{position:[0,-n,0],receiveShadow:!0,...r,children:[i.jsx("boxGeometry",{args:[e,n,t]}),i.jsx("meshStandardMaterial",{color:"#8b5a2b",roughness:.8,metalness:.1})]}),Eo=()=>{const e=nt(n=>n.gl),t=E.useRef(null);return E.useEffect(()=>{const n=document.createElement("div");n.style.cssText=`
      position: absolute;
      top: 60px; /* Statsの下あたり */
      left: 0px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      padding: 8px;
      font-family: monospace;
      font-size: 12px;
      pointer-events: none;
      z-index: 9999;
      min-width: 120px;
    `,document.body.appendChild(n),t.current=n;const r=e.info.autoReset;return e.info.autoReset=!1,()=>{n.parentNode&&n.parentNode.removeChild(n),e.info.autoReset=r}},[e]),En(()=>{if(!t.current)return;const{render:n,memory:r}=e.info;t.current.innerHTML=`
      <div style="font-weight:bold; margin-bottom:4px">Render Stats</div>
      <div>Calls: ${n.calls}</div>
      <div>Triangles: ${n.triangles}</div>
      <div>Points: ${n.points}</div>
      <div>Lines: ${n.lines}</div>
      <div style="margin-top:4px; border-top:1px solid #555; paddingTop:2px">
        Geometries: ${r.geometries}
      </div>
      <div>Textures: ${r.textures}</div>
    `,e.info.reset()}),null},xo=()=>{const{scene:e,gl:t}=nt(),n=E.useRef(1e3),r=E.useRef({});return E.useEffect(()=>(n.current=window.setInterval(()=>{const o=t.info.memory.geometries,s={},a=new Set;e.traverse(d=>{if(d instanceof wr&&d.geometry&&!a.has(d.geometry.uuid)){a.add(d.geometry.uuid);const u=d.geometry.type;s[u]=(s[u]||0)+1}});let c=!1;const l=[];new Set([...Object.keys(s),...Object.keys(r.current)]).forEach(d=>{const u=s[d]||0,h=r.current[d]||0,f=u-h;if(f!==0){c=!0;const m=f>0?"+":"";l.push(`${d}: ${h} -> ${u} (${m}${f})`)}}),c&&(console.groupCollapsed(`📊 Geometry Diff (Total: ${o})`),l.forEach(d=>{d.includes("+")?console.log(`%c${d}`,"color: red"):console.log(`%c${d}`,"color: green")}),console.groupEnd()),r.current=s},1e3),()=>clearInterval(n.current)),[e,t]),null},yo=()=>{const e=P.useField(),t=P.useActiveAliens(),n=E.useRef(null),r=O(f=>f.deselectCard),o=O(f=>f.hoverCell),s=O(f=>f.debugSettings.showFps);if(E.useEffect(()=>{const f=()=>{o(null)};return window.addEventListener("pointerup",f),window.addEventListener("pointercancel",f),()=>{window.removeEventListener("pointerup",f),window.removeEventListener("pointercancel",f)}},[o]),!e||!e.cells)return null;const a=e.cells.length,c=e.cells[0]?.length??0,l=e.width*1.05,p=e.height*1.05,d=f=>{f.stopPropagation(),r()},u=f=>{f.stopPropagation(),o(null)},h=f=>{f.stopPropagation()};return i.jsxs(i.Fragment,{children:[s&&i.jsxs(i.Fragment,{children:[i.jsx(fr,{}),i.jsx(Eo,{}),i.jsx(xo,{})]}),i.jsxs("group",{ref:n,children:[i.jsx("mesh",{position:[0,-.1,0],rotation:[-Math.PI/2,0,0],onClick:d,onPointerOver:u,visible:!1,children:i.jsx("planeGeometry",{args:[100,100]})}),c>0&&a>0&&i.jsx(mo,{width:l,height:p,thickness:.1,onPointerOver:h}),i.jsx("group",{name:"grid-layer",position:[0,.01,0],children:e.cells.flat().map(f=>i.jsx(qr,{cell:f},`cell-${f.x}-${f.y}`))}),i.jsx("group",{name:"token-layer",position:[0,.05,0],children:Object.values(t).map(f=>i.jsx(Rn,{x:f.currentX,y:f.currentY,status:f.status,cardDefinitionId:f.cardDefinitionId},`alien-${f.instanceId}`))}),i.jsx("group",{position:[0,.07,0],children:i.jsx(go,{})})]})]})},So={key:"field-grid",renderUI:e=>e==="main-3d"?i.jsx(yo,{}):null},g={CARD_BASE:{WIDTH:2.9,HEIGHT:4.4,THICKNESS:.15,CORNER_RADIUS:.075,BORDER_THICKNESS:.09,get Z_SURFACE(){return .0765}},layers:{BASE:0,BASE_INNER:.001,HEADER:.005,IMAGE:.007,DESC_BG:.007,COST_BG:.009,TEXT:.01,OVERLAY:.02,DIM_OVERLAY:.021},getZ(e){return this.CARD_BASE.Z_SURFACE+e},AREAS:{BASE_INNER:{get WIDTH(){return g.CARD_BASE.WIDTH-g.CARD_BASE.BORDER_THICKNESS*2},get HEIGHT(){return g.CARD_BASE.HEIGHT-g.CARD_BASE.BORDER_THICKNESS*2},get CONTENT_WIDTH(){return this.WIDTH-.15},get CONTENT_HEIGHT(){return this.HEIGHT-.15},get CORNER_RADIUS(){return Math.max(0,g.CARD_BASE.CORNER_RADIUS-g.CARD_BASE.BORDER_THICKNESS/2)},get POSITION(){return[0,0,g.getZ(g.layers.BASE_INNER)]}},HEADER:{TOP_Y_OFFSET:.015,SIDE_EDGE_Y_OFFSET:.075,CURVE_AMPLITUDE:.09,BEZIER_CONTROL_X_RATIO:1/3,BEZIER_TANGENT_X_RATIO:1/6,get SIZE(){return[g.AREAS.BASE_INNER.CONTENT_WIDTH,g.AREAS.BASE_INNER.CONTENT_HEIGHT/6]},get TOP_LINE(){return g.AREAS.BASE_INNER.CONTENT_HEIGHT/2-this.TOP_Y_OFFSET},get CENTER_LINE(){return this.TOP_LINE-this.SIZE[1]/2},get BOTTOM_LINE(){return this.TOP_LINE-this.SIZE[1]},get POSITION(){return[0,0,g.getZ(g.layers.HEADER)]}},COST:{RADIUS:.1875,X_OFFSET:.285,Y_OFFSET:.285,get POSITION(){return[g.CARD_BASE.WIDTH/2-this.X_OFFSET,g.CARD_BASE.HEIGHT/2-this.Y_OFFSET,g.getZ(g.layers.COST_BG)]}},USAGE_LIMIT:{RADIUS:.15,X_OFFSET:.285,Y_OFFSET:.285,get POSITION(){return[g.CARD_BASE.WIDTH/2-this.X_OFFSET,-(g.CARD_BASE.HEIGHT/2-this.Y_OFFSET),g.getZ(g.layers.COST_BG)]}},IMAGE:{TOP_Y_OFFSET:.015,IMAGE_PLANE_HEIGHT:1.35,get SIZE(){return[g.AREAS.BASE_INNER.CONTENT_WIDTH,this.IMAGE_PLANE_HEIGHT]},get TOP_LINE(){return g.AREAS.HEADER.BOTTOM_LINE-this.TOP_Y_OFFSET},get CENTER_LINE(){return this.TOP_LINE-this.SIZE[1]/2},get BOTTOM_LINE(){return this.TOP_LINE-this.SIZE[1]},get POSITION(){return[0,this.CENTER_LINE,g.getZ(g.layers.IMAGE)]}},DESC:{TOP_Y_OFFSET:.075,PLANE_HEIGHT:1.9,get SIZE(){return[g.AREAS.BASE_INNER.CONTENT_WIDTH,this.PLANE_HEIGHT]},get TOP_LINE(){return g.AREAS.IMAGE.BOTTOM_LINE-this.TOP_Y_OFFSET},get CENTER_LINE(){return this.TOP_LINE-this.SIZE[1]/2},get POSITION(){return[0,this.CENTER_LINE,g.getZ(g.layers.DESC_BG)]}},COOLDOWN:{OPACITY:.85,COLOR:"#aaddff",TEXTURE_SCALE:1,get POSITION(){return[0,0,g.getZ(g.layers.OVERLAY+.02)]},get SIZE(){return[g.CARD_BASE.WIDTH,g.CARD_BASE.HEIGHT]}},DIM_OVERLAY:{COLOR:"black",OPACITY:.2,get POSITION(){return[0,0,g.getZ(g.layers.DIM_OVERLAY)]},get SIZE(){return[g.CARD_BASE.WIDTH,g.CARD_BASE.HEIGHT]}},TEXT:{HEADER:{FONT:"MPLUS1p-Bold.ttf",FONT_SIZE:.21,ANCHOR_X:"center",ANCHOR_Y:"middle",get POSITION(){return[0,g.AREAS.HEADER.CENTER_LINE,g.getZ(g.layers.HEADER+.01)]}},COST:{FONT:"MPLUS1p-Bold.ttf",FONT_SIZE:.24,COLOR:"black",get POSITION(){const[e,t,n]=g.AREAS.COST.POSITION;return[e,t,n+.01]}},USAGE_LIMIT:{FONT:"MPLUS1p-Bold.ttf",FONT_SIZE:.18,COLOR:"white",get POSITION(){const[e,t,n]=g.AREAS.USAGE_LIMIT.POSITION;return[e,t,n+.01]}},DESC:{FONT:"MPLUS1p-Regular.ttf",FONT_SIZE:.135,LINE_HEIGHT:1.2,ANCHOR_X:"center",ANCHOR_Y:"top",OVERFLOW_WRAP:"break-word",PADDING_TOP:.075,get POSITION(){const[e,t,n]=g.AREAS.DESC.POSITION,r=g.AREAS.DESC.PLANE_HEIGHT;return[e,t+r/2-this.PADDING_TOP,n+.01]},get MAX_WIDTH(){return g.AREAS.BASE_INNER.CONTENT_WIDTH-.18}},COOLDOWN:{FONT:"MPLUS1p-Bold.ttf",FONT_SIZE:.75,COLOR:"#004488",ANCHOR_X:"center",ANCHOR_Y:"middle",get POSITION(){return[0,0,g.getZ(g.layers.OVERLAY+.03)]}}}},COLORS:{BORDER:"#B8860B",CARD_UI:k.COLORS.CARD_UI,CARD_TYPES:k.COLORS.CARD_TYPES,USAGE_LIMIT_BG:"#444"}},ie=g.COLORS,_={CARDS_PER_PAGE:3,CARD_GAP_X:.2,PAGE_GAP_X:3,POSITION:{X:0,Y:1.5,Z:{VISIBLE:4,HIDDEN:7}},CARD:{ROTATION:{X:-(Math.PI/2.2),Y:0,Z:0}},GESTURE:{PLANE_PADDING_X:1,PLANE_HEIGHT:4.5,ROTATION:{X:-Math.PI/2,Y:0,Z:0},POSITION:{X:0,Y:-.3,Z:-.225},MATERIAL:{OPACITY:0,DEPTH_WRITE:!1}},ANIMATION:{Z_SELECTED:2.5,Z_DEFAULT:0,SPRING_CONFIG:{tension:700,friction:40}},get PAGE_WIDTH(){return this.CARDS_PER_PAGE*g.CARD_BASE.WIDTH+(this.CARDS_PER_PAGE-1)*this.CARD_GAP_X},calcCardXLocal(e){const t=this.PAGE_WIDTH,n=g.CARD_BASE.WIDTH,r=this.CARD_GAP_X;return-t/2+e*(n+r)+n/2},calcDimState(e){const{isVisible:t,isAnySelected:n,isSelected:r}=e;return t?n?!r:!1:!0},calcTargetZ(e){const{isSelected:t,isAnySelected:n,isVisible:r}=e;if(t){if(r)return this.ANIMATION.Z_SELECTED;{const o=this.POSITION.Z.HIDDEN-this.POSITION.Z.VISIBLE;return this.ANIMATION.Z_SELECTED-o}}return r&&n?this.POSITION.Z.HIDDEN-this.POSITION.Z.VISIBLE:0},calcGesturePlaneArgs(e){return[e+this.GESTURE.PLANE_PADDING_X,this.GESTURE.PLANE_HEIGHT]},calcPageOffsetX(e){const{pageIndex:t,pageWidth:n}=e;return t*(n+this.PAGE_GAP_X)}},Io=(e,t)=>{const[n,r]=E.useState(!0),o=n&&!e&&t,{zPos:s}=rt({zPos:o?_.POSITION.Z.VISIBLE:_.POSITION.Z.HIDDEN,config:_.ANIMATION.SPRING_CONFIG});return{state:{isVisible:n,effectiveIsVisible:o},animation:{zPos:s},actions:{show:E.useCallback(()=>r(!0),[]),hide:E.useCallback(()=>r(!1),[]),toggle:E.useCallback(()=>r(a=>!a),[])}}},Co=()=>{const e=P.ui.useSelectedCardId(),t=E.useCallback(r=>{console.log(`[CardSelect] card: ${r}`),B.ui.selectCard(r)},[]),n=E.useCallback(()=>{console.log(`[CardDeselect] card: ${e}`),B.ui.deselectCard()},[]);return{selectedCardId:e,isAnySelected:!!e,actions:{select:t,deselect:n}}},To=e=>{const t=P.usePlayer(e),n=P.useActivePlayer(),r=P.ui.useIsInteractionLocked(),[o,s]=E.useState(0),a=t?.facingFactor??1,c=n===e,{selectedCardId:l,isAnySelected:p,actions:d}=Co(),u=E.useMemo(()=>(t?.cardLibrary??[]).map(D=>{const v=K.find(R=>R.id===D.cardDefinitionId);return v?{...v,instanceId:D.instanceId}:null}).filter(Boolean),[t?.cardLibrary]),h=E.useMemo(()=>u.some(S=>S.instanceId===l),[u,l]);E.useEffect(()=>{!c&&h&&(console.log(`[UI] 🔄 Turn Ended for ${e}: Deselecting my card.`),d.deselect())},[c,h,d,e]);const{state:f,animation:m,actions:x}=Io(p,c),y=Math.max(0,Math.ceil(u.length/_.CARDS_PER_PAGE)-1),I=_.PAGE_WIDTH,{xPos:b}=rt({xPos:-o*(I+_.PAGE_GAP_X),config:_.ANIMATION.SPRING_CONFIG}),C={onSwipeUp:E.useCallback(()=>x.show(),[x]),onSwipeDown:E.useCallback(()=>x.hide(),[x]),onSwipeLeft:E.useCallback(()=>s(S=>Math.min(y,S+1)),[y]),onSwipeRight:E.useCallback(()=>s(S=>Math.max(0,S-1)),[]),onAreaClick:E.useCallback(()=>{p&&d.deselect()},[p,d]),onCardSelect:E.useCallback(S=>{if(r||!c)return;if(t?.cooldownActiveCards.some(v=>v.cardId===S.instanceId)){B.ui.notify({message:"クールダウン中です",player:e});return}if(S.usageLimit!==void 0&&(t?.limitedCardsUsedCount?.[S.id]??0)>=S.usageLimit){B.ui.notify({message:"使用回数制限に達しています",player:e});return}d.select(S.instanceId)},[r,c,t,e,d]),onCardDeselect:E.useCallback(()=>d.deselect(),[d])};return{state:{cards:u,isVisible:f.isVisible,effectiveIsVisible:f.effectiveIsVisible,isAnySelected:p,selectedCardId:l,isInteractionLocked:r,isMyTurn:c},layout:{facingFactor:a,zPos:m.zPos,xPos:b,pageWidth:I},handlers:C}},Ao=({card:e,player:t})=>{const[n,r]=E.useState(!1),[o,s]=E.useState("https://placehold.co/256x160/ccc/999?text=Loading"),a=P.ui.useSelectedCardId(),c=P.useActivePlayer(),l=P.usePlayer(t),p=l?.cooldownActiveCards.find(S=>S.cardId===e.instanceId),d=!!p,u=a===e.instanceId,h=c===t,f=e.usageLimit!==void 0,m=l?.limitedCardsUsedCount?.[e.id]??0,x=f?e.usageLimit-m:void 0,y=f?x>0:!0,I=h&&!d&&y;E.useEffect(()=>{const S=new Image;S.crossOrigin="Anonymous",S.src=e.imagePath,S.onload=()=>s(e.imagePath)},[e.imagePath]);const b=E.useMemo(()=>{switch(e.cardType){case"alien":return ie.CARD_TYPES.ALIEN;case"eradication":return ie.CARD_TYPES.ERADICATION;case"recovery":return ie.CARD_TYPES.RECOVERY;default:return ie.CARD_TYPES.DEFAULT}},[e.cardType]),C=u?ie.CARD_UI.BORDER_SELECTED:n?ie.CARD_UI.BORDER_HOVER:ie.CARD_UI.BORDER_DEFAULT;return{state:{isHovered:n,isSelected:u,isPlayable:I,isCooldown:d,isMyTurn:h,isUsable:y},data:{textureUrl:o,headerColor:b,borderStateColor:C,cooldownRounds:p?.roundsRemaining,remainingUses:x,hasUsageLimit:f},handlers:{setIsHovered:r}}},zt=(e,t)=>{e.bezierCurveTo(t.cp1.x,t.cp1.y,t.cp2.x,t.cp2.y,t.end.x,t.end.y)},bo=()=>{const e=g.AREAS.HEADER,[t]=e.SIZE,n=e.TOP_LINE,r=e.BOTTOM_LINE,o=t/2,s=-o,a=o,c=n-e.SIDE_EDGE_Y_OFFSET,l=n+e.CURVE_AMPLITUDE,p=n-e.CURVE_AMPLITUDE,d=t*e.BEZIER_CONTROL_X_RATIO,u=t*e.BEZIER_TANGENT_X_RATIO;return{leftBottom:{x:s,y:r},rightBottom:{x:a,y:r},leftTop:{x:s,y:n},rightTop:{x:a,y:n},leftSideDip:{x:s,y:c},rightSideDip:{x:a,y:c},leftEntryTangent:{x:s,y:n},leftCrest:{x:-d,y:l},leftTangent:{x:-u,y:n},centerValley:{x:0,y:p},rightTangent:{x:u,y:n}}},Ro=e=>{const t={cp1:e.leftEntryTangent,cp2:e.leftCrest,end:e.leftTangent},n={cp1:e.centerValley,cp2:e.rightTangent,end:e.rightSideDip};return{leftCurve:t,rightCurve:n}},vo=(e={})=>{const{debugNoCurves:t=!1}=e,n=new ot,r=bo();if(n.moveTo(r.leftBottom.x,r.leftBottom.y),t)return n.lineTo(r.leftTop.x,r.leftTop.y),n.lineTo(r.rightTop.x,r.rightTop.y),n.lineTo(r.rightBottom.x,r.rightBottom.y),n.closePath(),n;const{leftCurve:o,rightCurve:s}=Ro(r);return n.lineTo(r.leftSideDip.x,r.leftSideDip.y),zt(n,o),zt(n,s),n.lineTo(r.rightBottom.x,r.rightBottom.y),n.closePath(),n},Oo=()=>{const e=new ot,t=g.AREAS.BASE_INNER,n=t.WIDTH,r=t.HEIGHT,o=t.CORNER_RADIUS,s=-n/2,a=n/2,c=-r/2,l=r/2;return e.moveTo(s,c+o),e.lineTo(s,l-o),e.quadraticCurveTo(s,l,s+o,l),e.lineTo(a-o,l),e.quadraticCurveTo(a,l,a,l-o),e.lineTo(a,c+o),e.quadraticCurveTo(a,c,a-o,c),e.lineTo(s+o,c),e.quadraticCurveTo(s,c,s,c+o),e},vn=re.meshStandardMaterial,je=re.meshBasicMaterial,wo=({card:e,player:t,isDimmed:n})=>{const{state:r,data:o,handlers:s}=Ao({card:e,player:t}),a=E.useMemo(()=>Oo(),[]),c=E.useMemo(()=>vo(),[]);return i.jsxs(re.group,{onPointerEnter:()=>r.isPlayable&&s.setIsHovered(!0),onPointerLeave:()=>s.setIsHovered(!1),children:[i.jsx(_o,{isSelected:r.isSelected,borderStateColor:o.borderStateColor}),i.jsx(Po,{baseShape:a}),i.jsx(Do,{card:e,headerShape:c,data:o}),i.jsx(No,{card:e}),i.jsx(Lo,{textureUrl:o.textureUrl}),i.jsx(Fo,{card:e}),o.hasUsageLimit&&i.jsx(jo,{remainingUses:o.remainingUses}),i.jsx(Mo,{isCooldown:r.isCooldown,cooldownRounds:o.cooldownRounds}),i.jsx(ko,{isUsable:r.isUsable}),i.jsx(Go,{isDimmed:n})]})},_o=({isSelected:e,borderStateColor:t})=>{const{CARD_BASE:n}=g;return i.jsx(xn,{args:[n.WIDTH,n.HEIGHT,n.THICKNESS],radius:n.CORNER_RADIUS,children:i.jsx(vn,{color:t,emissive:e?t:"black",emissiveIntensity:e?.5:0})})},Po=({baseShape:e})=>i.jsxs("mesh",{position:g.AREAS.BASE_INNER.POSITION,children:[i.jsx("shapeGeometry",{args:[e]}),i.jsx(vn,{color:g.COLORS.CARD_UI.BASE_BG})]}),Do=({card:e,headerShape:t,data:n})=>i.jsxs(i.Fragment,{children:[i.jsxs("mesh",{position:g.AREAS.HEADER.POSITION,children:[i.jsx("shapeGeometry",{args:[t]}),i.jsx(je,{color:n.headerColor})]}),i.jsx(De,{position:g.AREAS.TEXT.HEADER.POSITION,font:g.AREAS.TEXT.HEADER.FONT,fontSize:g.AREAS.TEXT.HEADER.FONT_SIZE,color:g.COLORS.CARD_UI.TEXT_WHITE,anchorX:g.AREAS.TEXT.HEADER.ANCHOR_X,anchorY:g.AREAS.TEXT.HEADER.ANCHOR_Y,maxWidth:g.AREAS.BASE_INNER.CONTENT_WIDTH,children:e.name})]}),No=({card:e})=>i.jsxs(i.Fragment,{children:[i.jsxs("mesh",{position:g.AREAS.COST.POSITION,children:[i.jsx("circleGeometry",{args:[g.AREAS.COST.RADIUS,32]}),i.jsx(je,{color:g.COLORS.BORDER})]}),i.jsx(De,{position:g.AREAS.TEXT.COST.POSITION,fontSize:g.AREAS.TEXT.COST.FONT_SIZE,font:g.AREAS.TEXT.COST.FONT,color:g.AREAS.TEXT.COST.COLOR,anchorX:"center",anchorY:"middle",children:e.cost})]}),jo=({remainingUses:e})=>i.jsxs(i.Fragment,{children:[i.jsxs("mesh",{position:g.AREAS.USAGE_LIMIT.POSITION,children:[i.jsx("circleGeometry",{args:[g.AREAS.USAGE_LIMIT.RADIUS,32]}),i.jsx(je,{color:g.COLORS.USAGE_LIMIT_BG})]}),i.jsx(De,{position:g.AREAS.TEXT.USAGE_LIMIT.POSITION,fontSize:g.AREAS.TEXT.USAGE_LIMIT.FONT_SIZE,font:g.AREAS.TEXT.USAGE_LIMIT.FONT,color:g.AREAS.TEXT.USAGE_LIMIT.COLOR,anchorX:"center",anchorY:"middle",children:e})]}),Lo=({textureUrl:e})=>{const t=tt(e);return i.jsxs(re.mesh,{position:g.AREAS.IMAGE.POSITION,children:[i.jsx("planeGeometry",{args:g.AREAS.IMAGE.SIZE}),i.jsx("meshStandardMaterial",{map:t})]})},Fo=({card:e})=>i.jsxs(i.Fragment,{children:[i.jsxs("mesh",{position:g.AREAS.DESC.POSITION,children:[i.jsx("planeGeometry",{args:g.AREAS.DESC.SIZE}),i.jsx(je,{color:g.COLORS.CARD_UI.DESC_BG})]}),i.jsx(De,{position:g.AREAS.TEXT.DESC.POSITION,font:g.AREAS.TEXT.DESC.FONT,fontSize:g.AREAS.TEXT.DESC.FONT_SIZE,color:g.COLORS.CARD_UI.TEXT_BLACK,anchorX:g.AREAS.TEXT.DESC.ANCHOR_X,anchorY:g.AREAS.TEXT.DESC.ANCHOR_Y,maxWidth:g.AREAS.TEXT.DESC.MAX_WIDTH,lineHeight:g.AREAS.TEXT.DESC.LINE_HEIGHT,overflowWrap:g.AREAS.TEXT.DESC.OVERFLOW_WRAP,children:e.description})]}),Mo=({isCooldown:e,cooldownRounds:t})=>e?i.jsxs(i.Fragment,{children:[i.jsxs("mesh",{position:g.AREAS.COOLDOWN.POSITION,children:[i.jsx("planeGeometry",{args:g.AREAS.COOLDOWN.SIZE}),i.jsx("meshStandardMaterial",{color:g.AREAS.COOLDOWN.COLOR,transparent:!0,opacity:g.AREAS.COOLDOWN.OPACITY,roughness:.1,metalness:.2,depthWrite:!1})]}),i.jsx(De,{position:g.AREAS.TEXT.COOLDOWN.POSITION,fontSize:g.AREAS.TEXT.COOLDOWN.FONT_SIZE,font:g.AREAS.TEXT.COOLDOWN.FONT,color:g.AREAS.TEXT.COOLDOWN.COLOR,anchorX:"center",anchorY:"middle",children:t})]}):null,ko=({isUsable:e})=>e?null:i.jsxs("mesh",{position:g.AREAS.COOLDOWN.POSITION,children:[i.jsx("planeGeometry",{args:g.AREAS.COOLDOWN.SIZE}),i.jsx("meshBasicMaterial",{color:"#330000",transparent:!0,opacity:.7,depthWrite:!1})]}),Go=({isDimmed:e})=>{const{opacity:t}=rt({opacity:e?g.AREAS.DIM_OVERLAY.OPACITY:0,config:{tension:400,friction:30}});return i.jsxs(re.mesh,{position:g.AREAS.DIM_OVERLAY.POSITION,visible:t.to(n=>n>.01),children:[i.jsx("planeGeometry",{args:g.AREAS.DIM_OVERLAY.SIZE}),i.jsx(je,{color:g.AREAS.DIM_OVERLAY.COLOR,transparent:!0,opacity:t,depthWrite:!1})]})},$o=({onSwipeUp:e,onSwipeDown:t,onSwipeLeft:n,onSwipeRight:r,onClick:o,facingFactor:s,enabled:a})=>{const{showGestureArea:c}=P.ui.useDebugSettings(),l=hr({onDrag:({movement:[d,u],velocity:[h,f],direction:[m,x],last:y,tap:I,event:b})=>{if(I||!y)return;b.stopPropagation();const C=45,S=.5;if(Math.abs(u)>Math.abs(d)&&Math.abs(u)>C&&Math.abs(f)>S*.5){x*s<0?e?.():t?.();return}Math.abs(d)>Math.abs(u)&&Math.abs(d)>C&&Math.abs(h)>S&&(m*s>0?r?.():n?.())},onClick:({event:d})=>{d.stopPropagation(),o?.()}},{enabled:a,drag:{filterTaps:!0,threshold:10}}),p=_.calcGesturePlaneArgs(_.PAGE_WIDTH);return i.jsx(gr,{args:p,rotation:[_.GESTURE.ROTATION.X,_.GESTURE.ROTATION.Y,_.GESTURE.ROTATION.Z],position:[_.GESTURE.POSITION.X,_.GESTURE.POSITION.Y,_.GESTURE.POSITION.Z],...l(),children:i.jsx("meshStandardMaterial",{transparent:!0,opacity:c?.3:_.GESTURE.MATERIAL.OPACITY,color:c?"#ff00ff":"white",depthWrite:_.GESTURE.MATERIAL.DEPTH_WRITE})})},Bo=({card:e,index:t,player:n,isSelected:r,isAnySelected:o,isVisible:s,onSelect:a,onDeselect:c})=>{const l=_.calcCardXLocal(t),p=_.calcDimState({isVisible:s,isAnySelected:o,isSelected:r}),d=_.calcTargetZ({isSelected:r,isAnySelected:o,isVisible:s}),u=rt({position:[l,0,d],rotation:[_.CARD.ROTATION.X,_.CARD.ROTATION.Y,_.CARD.ROTATION.Z],config:_.ANIMATION.SPRING_CONFIG});return i.jsx(re.group,{position:u.position,rotation:u.rotation,onClick:h=>{h.stopPropagation(),console.log(`[CardClick] isSelected: ${r}, isAnySelected: ${o}`),r?c():a(e)},children:i.jsx(wo,{card:e,player:n,isDimmed:p})})},Xt=({player:e})=>{const{state:t,layout:n,handlers:r}=To(e);if(t.cards.length===0)return null;const o=[];for(let s=0;s<t.cards.length;s+=_.CARDS_PER_PAGE)o.push(t.cards.slice(s,s+_.CARDS_PER_PAGE));return i.jsxs(re.group,{position:mr([n.zPos],s=>[_.POSITION.X,_.POSITION.Y,s*n.facingFactor]),rotation:[0,n.facingFactor===-1?Math.PI:0,0],children:[i.jsx($o,{onSwipeUp:r.onSwipeUp,onSwipeDown:r.onSwipeDown,onSwipeLeft:r.onSwipeLeft,onSwipeRight:r.onSwipeRight,onClick:r.onAreaClick,facingFactor:n.facingFactor,enabled:!t.isInteractionLocked}),i.jsx(re.group,{"position-x":n.xPos,children:o.map((s,a)=>i.jsx("group",{"position-x":_.calcPageOffsetX({pageIndex:a,pageWidth:n.pageWidth}),children:s.map((c,l)=>i.jsx(Bo,{card:c,index:l,player:e,isSelected:t.selectedCardId===c.instanceId,isAnySelected:t.isAnySelected,isVisible:t.effectiveIsVisible,onSelect:r.onCardSelect,onDeselect:r.onCardDeselect},c.instanceId))},a))})]})},Ho={key:"card-hand",renderUI:e=>e==="main-3d"?i.jsxs(i.Fragment,{children:[i.jsx(Xt,{player:"alien"}),i.jsx(Xt,{player:"native"})]}):null},Uo={key:"play-card",init:()=>{const e=({cell:t})=>{const r=O.getState().selectedCardId;if(!r)return;const o=F.getState(),s=o.activePlayerId,a=o.playerStates[s],c=a.cardLibrary.find(u=>u.instanceId===r);if(!c)return;const l=K.find(u=>u.id===c.cardDefinitionId);if(!l)return;if(a.currentEnvironment<l.cost){console.warn(`[PlayCard] Not enough AP. Required: ${l.cost}, Current: ${a.currentEnvironment}`),B.ui.notify({message:"APが不足しています",player:s});return}if(a.cooldownActiveCards.some(u=>u.cardId===r)){console.warn("[PlayCard] Card is on cooldown."),B.ui.notify({message:"クールダウン中です",player:s});return}const d=ao(o,l,{x:t.x,y:t.y});if(d!==o){const u=[...a.cooldownActiveCards];l.cooldownTurns&&l.cooldownTurns>0&&u.push({cardId:r,roundsRemaining:l.cooldownTurns});const h={...a.limitedCardsUsedCount};if(l.usageLimit!==void 0){const x=h[l.id]||0;h[l.id]=x+1}const f={...d.playerStates[s],currentEnvironment:a.currentEnvironment-l.cost,cardLibrary:a.cardLibrary,cooldownActiveCards:u,limitedCardsUsedCount:h},m={...d,playerStates:{...d.playerStates,[s]:f}};B.system.updateState(m),B.ui.deselectCard(),console.info(`[PlayCard] Played ${l.name}. AP consumed: ${l.cost}`)}};return H.on("CELL_CLICK",e),()=>{H.off("CELL_CLICK",e)}},renderUI:()=>null},zo=e=>{const{alienInstances:t,currentRound:n}=e,r={...t};let o=!1,s=0;return console.group("[Feature: Alien Growth] Processing..."),Object.values(r).forEach(a=>{a.status==="seed"&&a.spawnedRound<=n&&(r[a.instanceId]={...a,status:"plant"},o=!0,s++,console.log(`[Growth] 🌱 Seed (Spawned R${a.spawnedRound}) matured at the end of Round ${n}`))}),o?(console.info(`[Growth] 🌳 Total ${s} seeds matured.`),console.groupEnd(),{...e,alienInstances:r}):(console.log("[Growth] No seeds matured in this timing."),console.groupEnd(),e)},Xo={key:"alien-growth",init:()=>{const e=()=>{const t=F.getState(),n=zo(t);n!==t&&B.system.updateState(n)};return H.on("ROUND_END",e),()=>H.off("ROUND_END",e)},renderUI:()=>null},Yo=e=>{const{alienInstances:t,gameField:n}=e,r=n.cells.map(a=>[...a]);let o=!1,s=0;return console.group("[Feature: Alien Expansion] Processing Chain Expansion..."),Object.values(t).forEach(a=>{if(a.status!=="plant")return;const c=Vo(a.cardDefinitionId);if(!c)return;const{range:l}=c,p=l.scale,d=l.shape,u=[];n.cells.forEach((h,f)=>{h.forEach((m,x)=>{m.alienUnitId===a.instanceId&&u.push({x,y:f})})}),u.forEach(h=>{Zo(n.width,n.height,h,d,p).forEach(m=>{const x=n.cells[m.y][m.x];if(Wo(x)){if(r[m.y][m.x].type==="alien"||r[m.y][m.x].type==="alien-core")return;const y={...x,type:"alien",ownerId:"alien",alienUnitId:a.instanceId};r[m.y][m.x]=y,o=!0,s++}})})}),o?(console.info(`[Expansion] 🌊 Chain expansion completed. Total ${s} cells invaded.`),console.groupEnd(),{...e,gameField:{...n,cells:r}}):(console.log("[Expansion] No new invasions occurred."),console.groupEnd(),e)},Wo=e=>{const t=e.type;return t==="native"||t==="pioneer"||t==="bare"},Vo=e=>K.find(t=>t.id===e&&t.cardType==="alien"),Zo=(e,t,n,r,o)=>{const s=[],{x:a,y:c}=n,l=(p,d)=>{p>=0&&p<e&&d>=0&&d<t&&s.push({x:p,y:d})};for(let p=1;p<=o;p++)switch(r){case"vertical":l(a,c-p),l(a,c+p);break;case"horizon":l(a-p,c),l(a+p,c);break;case"cross":l(a,c-p),l(a,c+p),l(a-p,c),l(a+p,c);break;case"x_cross":l(a-p,c-p),l(a+p,c-p),l(a-p,c+p),l(a+p,c+p);break;case"range":for(let d=-p;d<=p;d++)for(let u=-p;u<=p;u++)(Math.abs(u)===p||Math.abs(d)===p)&&l(a+u,c+d);break}return s},Ko={key:"alien-expansion",init:()=>{const e=()=>{const t=F.getState(),n=Yo(t);n!==t&&B.system.updateState(n)};return H.on("ROUND_END",e),()=>H.off("ROUND_END",e)},renderUI:()=>null};var X=function(){return X=Object.assign||function(t){for(var n,r=1,o=arguments.length;r<o;r++){n=arguments[r];for(var s in n)Object.prototype.hasOwnProperty.call(n,s)&&(t[s]=n[s])}return t},X.apply(this,arguments)};function _e(e,t,n){if(n||arguments.length===2)for(var r=0,o=t.length,s;r<o;r++)(s||!(r in t))&&(s||(s=Array.prototype.slice.call(t,0,r)),s[r]=t[r]);return e.concat(s||Array.prototype.slice.call(t))}var N="-ms-",Oe="-moz-",w="-webkit-",On="comm",it="rule",Nt="decl",qo="@import",wn="@keyframes",Jo="@layer",_n=Math.abs,jt=String.fromCharCode,Tt=Object.assign;function Qo(e,t){return M(e,0)^45?(((t<<2^M(e,0))<<2^M(e,1))<<2^M(e,2))<<2^M(e,3):0}function Pn(e){return e.trim()}function J(e,t){return(e=t.exec(e))?e[0]:e}function T(e,t,n){return e.replace(t,n)}function Ye(e,t,n){return e.indexOf(t,n)}function M(e,t){return e.charCodeAt(t)|0}function ge(e,t,n){return e.slice(t,n)}function Z(e){return e.length}function Dn(e){return e.length}function ve(e,t){return t.push(e),e}function es(e,t){return e.map(t).join("")}function Yt(e,t){return e.filter(function(n){return!J(n,t)})}var at=1,me=1,Nn=0,W=0,L=0,Ce="";function ct(e,t,n,r,o,s,a,c){return{value:e,root:t,parent:n,type:r,props:o,children:s,line:at,column:me,length:a,return:"",siblings:c}}function ne(e,t){return Tt(ct("",null,null,"",null,null,0,e.siblings),e,{length:-e.length},t)}function fe(e){for(;e.root;)e=ne(e.root,{children:[e]});ve(e,e.siblings)}function ts(){return L}function ns(){return L=W>0?M(Ce,--W):0,me--,L===10&&(me=1,at--),L}function V(){return L=W<Nn?M(Ce,W++):0,me++,L===10&&(me=1,at++),L}function le(){return M(Ce,W)}function We(){return W}function lt(e,t){return ge(Ce,e,t)}function At(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function rs(e){return at=me=1,Nn=Z(Ce=e),W=0,[]}function os(e){return Ce="",e}function mt(e){return Pn(lt(W-1,bt(e===91?e+2:e===40?e+1:e)))}function ss(e){for(;(L=le())&&L<33;)V();return At(e)>2||At(L)>3?"":" "}function is(e,t){for(;--t&&V()&&!(L<48||L>102||L>57&&L<65||L>70&&L<97););return lt(e,We()+(t<6&&le()==32&&V()==32))}function bt(e){for(;V();)switch(L){case e:return W;case 34:case 39:e!==34&&e!==39&&bt(L);break;case 40:e===41&&bt(e);break;case 92:V();break}return W}function as(e,t){for(;V()&&e+L!==57;)if(e+L===84&&le()===47)break;return"/*"+lt(t,W-1)+"*"+jt(e===47?e:V())}function cs(e){for(;!At(le());)V();return lt(e,W)}function ls(e){return os(Ve("",null,null,null,[""],e=rs(e),0,[0],e))}function Ve(e,t,n,r,o,s,a,c,l){for(var p=0,d=0,u=a,h=0,f=0,m=0,x=1,y=1,I=1,b=0,C="",S=o,D=s,v=r,R=C;y;)switch(m=b,b=V()){case 40:if(m!=108&&M(R,u-1)==58){Ye(R+=T(mt(b),"&","&\f"),"&\f",_n(p?c[p-1]:0))!=-1&&(I=-1);break}case 34:case 39:case 91:R+=mt(b);break;case 9:case 10:case 13:case 32:R+=ss(m);break;case 92:R+=is(We()-1,7);continue;case 47:switch(le()){case 42:case 47:ve(ds(as(V(),We()),t,n,l),l);break;default:R+="/"}break;case 123*x:c[p++]=Z(R)*I;case 125*x:case 59:case 0:switch(b){case 0:case 125:y=0;case 59+d:I==-1&&(R=T(R,/\f/g,"")),f>0&&Z(R)-u&&ve(f>32?Vt(R+";",r,n,u-1,l):Vt(T(R," ","")+";",r,n,u-2,l),l);break;case 59:R+=";";default:if(ve(v=Wt(R,t,n,p,d,o,c,C,S=[],D=[],u,s),s),b===123)if(d===0)Ve(R,t,v,v,S,s,u,c,D);else switch(h===99&&M(R,3)===110?100:h){case 100:case 108:case 109:case 115:Ve(e,v,v,r&&ve(Wt(e,v,v,0,0,o,c,C,o,S=[],u,D),D),o,D,u,c,r?S:D);break;default:Ve(R,v,v,v,[""],D,0,c,D)}}p=d=f=0,x=I=1,C=R="",u=a;break;case 58:u=1+Z(R),f=m;default:if(x<1){if(b==123)--x;else if(b==125&&x++==0&&ns()==125)continue}switch(R+=jt(b),b*x){case 38:I=d>0?1:(R+="\f",-1);break;case 44:c[p++]=(Z(R)-1)*I,I=1;break;case 64:le()===45&&(R+=mt(V())),h=le(),d=u=Z(C=R+=cs(We())),b++;break;case 45:m===45&&Z(R)==2&&(x=0)}}return s}function Wt(e,t,n,r,o,s,a,c,l,p,d,u){for(var h=o-1,f=o===0?s:[""],m=Dn(f),x=0,y=0,I=0;x<r;++x)for(var b=0,C=ge(e,h+1,h=_n(y=a[x])),S=e;b<m;++b)(S=Pn(y>0?f[b]+" "+C:T(C,/&\f/g,f[b])))&&(l[I++]=S);return ct(e,t,n,o===0?it:c,l,p,d,u)}function ds(e,t,n,r){return ct(e,t,n,On,jt(ts()),ge(e,2,-2),0,r)}function Vt(e,t,n,r,o){return ct(e,t,n,Nt,ge(e,0,r),ge(e,r+1,-1),r,o)}function jn(e,t,n){switch(Qo(e,t)){case 5103:return w+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return w+e+e;case 4789:return Oe+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return w+e+Oe+e+N+e+e;case 5936:switch(M(e,t+11)){case 114:return w+e+N+T(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return w+e+N+T(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return w+e+N+T(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return w+e+N+e+e;case 6165:return w+e+N+"flex-"+e+e;case 5187:return w+e+T(e,/(\w+).+(:[^]+)/,w+"box-$1$2"+N+"flex-$1$2")+e;case 5443:return w+e+N+"flex-item-"+T(e,/flex-|-self/g,"")+(J(e,/flex-|baseline/)?"":N+"grid-row-"+T(e,/flex-|-self/g,""))+e;case 4675:return w+e+N+"flex-line-pack"+T(e,/align-content|flex-|-self/g,"")+e;case 5548:return w+e+N+T(e,"shrink","negative")+e;case 5292:return w+e+N+T(e,"basis","preferred-size")+e;case 6060:return w+"box-"+T(e,"-grow","")+w+e+N+T(e,"grow","positive")+e;case 4554:return w+T(e,/([^-])(transform)/g,"$1"+w+"$2")+e;case 6187:return T(T(T(e,/(zoom-|grab)/,w+"$1"),/(image-set)/,w+"$1"),e,"")+e;case 5495:case 3959:return T(e,/(image-set\([^]*)/,w+"$1$`$1");case 4968:return T(T(e,/(.+:)(flex-)?(.*)/,w+"box-pack:$3"+N+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+w+e+e;case 4200:if(!J(e,/flex-|baseline/))return N+"grid-column-align"+ge(e,t)+e;break;case 2592:case 3360:return N+T(e,"template-","")+e;case 4384:case 3616:return n&&n.some(function(r,o){return t=o,J(r.props,/grid-\w+-end/)})?~Ye(e+(n=n[t].value),"span",0)?e:N+T(e,"-start","")+e+N+"grid-row-span:"+(~Ye(n,"span",0)?J(n,/\d+/):+J(n,/\d+/)-+J(e,/\d+/))+";":N+T(e,"-start","")+e;case 4896:case 4128:return n&&n.some(function(r){return J(r.props,/grid-\w+-start/)})?e:N+T(T(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return T(e,/(.+)-inline(.+)/,w+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(Z(e)-1-t>6)switch(M(e,t+1)){case 109:if(M(e,t+4)!==45)break;case 102:return T(e,/(.+:)(.+)-([^]+)/,"$1"+w+"$2-$3$1"+Oe+(M(e,t+3)==108?"$3":"$2-$3"))+e;case 115:return~Ye(e,"stretch",0)?jn(T(e,"stretch","fill-available"),t,n)+e:e}break;case 5152:case 5920:return T(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,function(r,o,s,a,c,l,p){return N+o+":"+s+p+(a?N+o+"-span:"+(c?l:+l-+s)+p:"")+e});case 4949:if(M(e,t+6)===121)return T(e,":",":"+w)+e;break;case 6444:switch(M(e,M(e,14)===45?18:11)){case 120:return T(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+w+(M(e,14)===45?"inline-":"")+"box$3$1"+w+"$2$3$1"+N+"$2box$3")+e;case 100:return T(e,":",":"+N)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return T(e,"scroll-","scroll-snap-")+e}return e}function Je(e,t){for(var n="",r=0;r<e.length;r++)n+=t(e[r],r,e,t)||"";return n}function us(e,t,n,r){switch(e.type){case Jo:if(e.children.length)break;case qo:case Nt:return e.return=e.return||e.value;case On:return"";case wn:return e.return=e.value+"{"+Je(e.children,r)+"}";case it:if(!Z(e.value=e.props.join(",")))return""}return Z(n=Je(e.children,r))?e.return=e.value+"{"+n+"}":""}function ps(e){var t=Dn(e);return function(n,r,o,s){for(var a="",c=0;c<t;c++)a+=e[c](n,r,o,s)||"";return a}}function fs(e){return function(t){t.root||(t=t.return)&&e(t)}}function hs(e,t,n,r){if(e.length>-1&&!e.return)switch(e.type){case Nt:e.return=jn(e.value,e.length,n);return;case wn:return Je([ne(e,{value:T(e.value,"@","@"+w)})],r);case it:if(e.length)return es(n=e.props,function(o){switch(J(o,r=/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":fe(ne(e,{props:[T(o,/:(read-\w+)/,":"+Oe+"$1")]})),fe(ne(e,{props:[o]})),Tt(e,{props:Yt(n,r)});break;case"::placeholder":fe(ne(e,{props:[T(o,/:(plac\w+)/,":"+w+"input-$1")]})),fe(ne(e,{props:[T(o,/:(plac\w+)/,":"+Oe+"$1")]})),fe(ne(e,{props:[T(o,/:(plac\w+)/,N+"input-$1")]})),fe(ne(e,{props:[o]})),Tt(e,{props:Yt(n,r)});break}return""})}}var gs={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},Y={},Ee=typeof process<"u"&&Y!==void 0&&(Y.REACT_APP_SC_ATTR||Y.SC_ATTR)||"data-styled",Ln="active",Fn="data-styled-version",dt="6.1.19",Lt=`/*!sc*/
`,Qe=typeof window<"u"&&typeof document<"u",ms=!!(typeof SC_DISABLE_SPEEDY=="boolean"?SC_DISABLE_SPEEDY:typeof process<"u"&&Y!==void 0&&Y.REACT_APP_SC_DISABLE_SPEEDY!==void 0&&Y.REACT_APP_SC_DISABLE_SPEEDY!==""?Y.REACT_APP_SC_DISABLE_SPEEDY!=="false"&&Y.REACT_APP_SC_DISABLE_SPEEDY:typeof process<"u"&&Y!==void 0&&Y.SC_DISABLE_SPEEDY!==void 0&&Y.SC_DISABLE_SPEEDY!==""&&Y.SC_DISABLE_SPEEDY!=="false"&&Y.SC_DISABLE_SPEEDY),ut=Object.freeze([]),xe=Object.freeze({});function Es(e,t,n){return n===void 0&&(n=xe),e.theme!==n.theme&&e.theme||t||n.theme}var Mn=new Set(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","tr","track","u","ul","use","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"]),xs=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,ys=/(^-|-$)/g;function Zt(e){return e.replace(xs,"-").replace(ys,"")}var Ss=/(a)(d)/gi,Ue=52,Kt=function(e){return String.fromCharCode(e+(e>25?39:97))};function Rt(e){var t,n="";for(t=Math.abs(e);t>Ue;t=t/Ue|0)n=Kt(t%Ue)+n;return(Kt(t%Ue)+n).replace(Ss,"$1-$2")}var Et,kn=5381,he=function(e,t){for(var n=t.length;n;)e=33*e^t.charCodeAt(--n);return e},Gn=function(e){return he(kn,e)};function $n(e){return Rt(Gn(e)>>>0)}function Is(e){return e.displayName||e.name||"Component"}function xt(e){return typeof e=="string"&&!0}var Bn=typeof Symbol=="function"&&Symbol.for,Hn=Bn?Symbol.for("react.memo"):60115,Cs=Bn?Symbol.for("react.forward_ref"):60112,Ts={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},As={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},Un={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},bs=((Et={})[Cs]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},Et[Hn]=Un,Et);function qt(e){return("type"in(t=e)&&t.type.$$typeof)===Hn?Un:"$$typeof"in e?bs[e.$$typeof]:Ts;var t}var Rs=Object.defineProperty,vs=Object.getOwnPropertyNames,Jt=Object.getOwnPropertySymbols,Os=Object.getOwnPropertyDescriptor,ws=Object.getPrototypeOf,Qt=Object.prototype;function zn(e,t,n){if(typeof t!="string"){if(Qt){var r=ws(t);r&&r!==Qt&&zn(e,r,n)}var o=vs(t);Jt&&(o=o.concat(Jt(t)));for(var s=qt(e),a=qt(t),c=0;c<o.length;++c){var l=o[c];if(!(l in As||n&&n[l]||a&&l in a||s&&l in s)){var p=Os(t,l);try{Rs(e,l,p)}catch{}}}}return e}function ye(e){return typeof e=="function"}function Ft(e){return typeof e=="object"&&"styledComponentId"in e}function ce(e,t){return e&&t?"".concat(e," ").concat(t):e||t||""}function vt(e,t){if(e.length===0)return"";for(var n=e[0],r=1;r<e.length;r++)n+=e[r];return n}function Pe(e){return e!==null&&typeof e=="object"&&e.constructor.name===Object.name&&!("props"in e&&e.$$typeof)}function Ot(e,t,n){if(n===void 0&&(n=!1),!n&&!Pe(e)&&!Array.isArray(e))return t;if(Array.isArray(t))for(var r=0;r<t.length;r++)e[r]=Ot(e[r],t[r]);else if(Pe(t))for(var r in t)e[r]=Ot(e[r],t[r]);return e}function Mt(e,t){Object.defineProperty(e,"toString",{value:t})}function Le(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return new Error("An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#".concat(e," for more information.").concat(t.length>0?" Args: ".concat(t.join(", ")):""))}var _s=(function(){function e(t){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=t}return e.prototype.indexOfGroup=function(t){for(var n=0,r=0;r<t;r++)n+=this.groupSizes[r];return n},e.prototype.insertRules=function(t,n){if(t>=this.groupSizes.length){for(var r=this.groupSizes,o=r.length,s=o;t>=s;)if((s<<=1)<0)throw Le(16,"".concat(t));this.groupSizes=new Uint32Array(s),this.groupSizes.set(r),this.length=s;for(var a=o;a<s;a++)this.groupSizes[a]=0}for(var c=this.indexOfGroup(t+1),l=(a=0,n.length);a<l;a++)this.tag.insertRule(c,n[a])&&(this.groupSizes[t]++,c++)},e.prototype.clearGroup=function(t){if(t<this.length){var n=this.groupSizes[t],r=this.indexOfGroup(t),o=r+n;this.groupSizes[t]=0;for(var s=r;s<o;s++)this.tag.deleteRule(r)}},e.prototype.getGroup=function(t){var n="";if(t>=this.length||this.groupSizes[t]===0)return n;for(var r=this.groupSizes[t],o=this.indexOfGroup(t),s=o+r,a=o;a<s;a++)n+="".concat(this.tag.getRule(a)).concat(Lt);return n},e})(),Ze=new Map,et=new Map,Ke=1,ze=function(e){if(Ze.has(e))return Ze.get(e);for(;et.has(Ke);)Ke++;var t=Ke++;return Ze.set(e,t),et.set(t,e),t},Ps=function(e,t){Ke=t+1,Ze.set(e,t),et.set(t,e)},Ds="style[".concat(Ee,"][").concat(Fn,'="').concat(dt,'"]'),Ns=new RegExp("^".concat(Ee,'\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')),js=function(e,t,n){for(var r,o=n.split(","),s=0,a=o.length;s<a;s++)(r=o[s])&&e.registerName(t,r)},Ls=function(e,t){for(var n,r=((n=t.textContent)!==null&&n!==void 0?n:"").split(Lt),o=[],s=0,a=r.length;s<a;s++){var c=r[s].trim();if(c){var l=c.match(Ns);if(l){var p=0|parseInt(l[1],10),d=l[2];p!==0&&(Ps(d,p),js(e,d,l[3]),e.getTag().insertRules(p,o)),o.length=0}else o.push(c)}}},en=function(e){for(var t=document.querySelectorAll(Ds),n=0,r=t.length;n<r;n++){var o=t[n];o&&o.getAttribute(Ee)!==Ln&&(Ls(e,o),o.parentNode&&o.parentNode.removeChild(o))}};function Fs(){return typeof __webpack_nonce__<"u"?__webpack_nonce__:null}var Xn=function(e){var t=document.head,n=e||t,r=document.createElement("style"),o=(function(c){var l=Array.from(c.querySelectorAll("style[".concat(Ee,"]")));return l[l.length-1]})(n),s=o!==void 0?o.nextSibling:null;r.setAttribute(Ee,Ln),r.setAttribute(Fn,dt);var a=Fs();return a&&r.setAttribute("nonce",a),n.insertBefore(r,s),r},Ms=(function(){function e(t){this.element=Xn(t),this.element.appendChild(document.createTextNode("")),this.sheet=(function(n){if(n.sheet)return n.sheet;for(var r=document.styleSheets,o=0,s=r.length;o<s;o++){var a=r[o];if(a.ownerNode===n)return a}throw Le(17)})(this.element),this.length=0}return e.prototype.insertRule=function(t,n){try{return this.sheet.insertRule(n,t),this.length++,!0}catch{return!1}},e.prototype.deleteRule=function(t){this.sheet.deleteRule(t),this.length--},e.prototype.getRule=function(t){var n=this.sheet.cssRules[t];return n&&n.cssText?n.cssText:""},e})(),ks=(function(){function e(t){this.element=Xn(t),this.nodes=this.element.childNodes,this.length=0}return e.prototype.insertRule=function(t,n){if(t<=this.length&&t>=0){var r=document.createTextNode(n);return this.element.insertBefore(r,this.nodes[t]||null),this.length++,!0}return!1},e.prototype.deleteRule=function(t){this.element.removeChild(this.nodes[t]),this.length--},e.prototype.getRule=function(t){return t<this.length?this.nodes[t].textContent:""},e})(),Gs=(function(){function e(t){this.rules=[],this.length=0}return e.prototype.insertRule=function(t,n){return t<=this.length&&(this.rules.splice(t,0,n),this.length++,!0)},e.prototype.deleteRule=function(t){this.rules.splice(t,1),this.length--},e.prototype.getRule=function(t){return t<this.length?this.rules[t]:""},e})(),tn=Qe,$s={isServer:!Qe,useCSSOMInjection:!ms},Yn=(function(){function e(t,n,r){t===void 0&&(t=xe),n===void 0&&(n={});var o=this;this.options=X(X({},$s),t),this.gs=n,this.names=new Map(r),this.server=!!t.isServer,!this.server&&Qe&&tn&&(tn=!1,en(this)),Mt(this,function(){return(function(s){for(var a=s.getTag(),c=a.length,l="",p=function(u){var h=(function(I){return et.get(I)})(u);if(h===void 0)return"continue";var f=s.names.get(h),m=a.getGroup(u);if(f===void 0||!f.size||m.length===0)return"continue";var x="".concat(Ee,".g").concat(u,'[id="').concat(h,'"]'),y="";f!==void 0&&f.forEach(function(I){I.length>0&&(y+="".concat(I,","))}),l+="".concat(m).concat(x,'{content:"').concat(y,'"}').concat(Lt)},d=0;d<c;d++)p(d);return l})(o)})}return e.registerId=function(t){return ze(t)},e.prototype.rehydrate=function(){!this.server&&Qe&&en(this)},e.prototype.reconstructWithOptions=function(t,n){return n===void 0&&(n=!0),new e(X(X({},this.options),t),this.gs,n&&this.names||void 0)},e.prototype.allocateGSInstance=function(t){return this.gs[t]=(this.gs[t]||0)+1},e.prototype.getTag=function(){return this.tag||(this.tag=(t=(function(n){var r=n.useCSSOMInjection,o=n.target;return n.isServer?new Gs(o):r?new Ms(o):new ks(o)})(this.options),new _s(t)));var t},e.prototype.hasNameForId=function(t,n){return this.names.has(t)&&this.names.get(t).has(n)},e.prototype.registerName=function(t,n){if(ze(t),this.names.has(t))this.names.get(t).add(n);else{var r=new Set;r.add(n),this.names.set(t,r)}},e.prototype.insertRules=function(t,n,r){this.registerName(t,n),this.getTag().insertRules(ze(t),r)},e.prototype.clearNames=function(t){this.names.has(t)&&this.names.get(t).clear()},e.prototype.clearRules=function(t){this.getTag().clearGroup(ze(t)),this.clearNames(t)},e.prototype.clearTag=function(){this.tag=void 0},e})(),Bs=/&/g,Hs=/^\s*\/\/.*$/gm;function Wn(e,t){return e.map(function(n){return n.type==="rule"&&(n.value="".concat(t," ").concat(n.value),n.value=n.value.replaceAll(",",",".concat(t," ")),n.props=n.props.map(function(r){return"".concat(t," ").concat(r)})),Array.isArray(n.children)&&n.type!=="@keyframes"&&(n.children=Wn(n.children,t)),n})}function Us(e){var t,n,r,o=xe,s=o.options,a=s===void 0?xe:s,c=o.plugins,l=c===void 0?ut:c,p=function(h,f,m){return m.startsWith(n)&&m.endsWith(n)&&m.replaceAll(n,"").length>0?".".concat(t):h},d=l.slice();d.push(function(h){h.type===it&&h.value.includes("&")&&(h.props[0]=h.props[0].replace(Bs,n).replace(r,p))}),a.prefix&&d.push(hs),d.push(us);var u=function(h,f,m,x){f===void 0&&(f=""),m===void 0&&(m=""),x===void 0&&(x="&"),t=x,n=f,r=new RegExp("\\".concat(n,"\\b"),"g");var y=h.replace(Hs,""),I=ls(m||f?"".concat(m," ").concat(f," { ").concat(y," }"):y);a.namespace&&(I=Wn(I,a.namespace));var b=[];return Je(I,ps(d.concat(fs(function(C){return b.push(C)})))),b};return u.hash=l.length?l.reduce(function(h,f){return f.name||Le(15),he(h,f.name)},kn).toString():"",u}var zs=new Yn,wt=Us(),Vn=oe.createContext({shouldForwardProp:void 0,styleSheet:zs,stylis:wt});Vn.Consumer;oe.createContext(void 0);function nn(){return E.useContext(Vn)}var Zn=(function(){function e(t,n){var r=this;this.inject=function(o,s){s===void 0&&(s=wt);var a=r.name+s.hash;o.hasNameForId(r.id,a)||o.insertRules(r.id,a,s(r.rules,a,"@keyframes"))},this.name=t,this.id="sc-keyframes-".concat(t),this.rules=n,Mt(this,function(){throw Le(12,String(r.name))})}return e.prototype.getName=function(t){return t===void 0&&(t=wt),this.name+t.hash},e})(),Xs=function(e){return e>="A"&&e<="Z"};function rn(e){for(var t="",n=0;n<e.length;n++){var r=e[n];if(n===1&&r==="-"&&e[0]==="-")return e;Xs(r)?t+="-"+r.toLowerCase():t+=r}return t.startsWith("ms-")?"-"+t:t}var Kn=function(e){return e==null||e===!1||e===""},qn=function(e){var t,n,r=[];for(var o in e){var s=e[o];e.hasOwnProperty(o)&&!Kn(s)&&(Array.isArray(s)&&s.isCss||ye(s)?r.push("".concat(rn(o),":"),s,";"):Pe(s)?r.push.apply(r,_e(_e(["".concat(o," {")],qn(s),!1),["}"],!1)):r.push("".concat(rn(o),": ").concat((t=o,(n=s)==null||typeof n=="boolean"||n===""?"":typeof n!="number"||n===0||t in gs||t.startsWith("--")?String(n).trim():"".concat(n,"px")),";")))}return r};function de(e,t,n,r){if(Kn(e))return[];if(Ft(e))return[".".concat(e.styledComponentId)];if(ye(e)){if(!ye(s=e)||s.prototype&&s.prototype.isReactComponent||!t)return[e];var o=e(t);return de(o,t,n,r)}var s;return e instanceof Zn?n?(e.inject(n,r),[e.getName(r)]):[e]:Pe(e)?qn(e):Array.isArray(e)?Array.prototype.concat.apply(ut,e.map(function(a){return de(a,t,n,r)})):[e.toString()]}function Ys(e){for(var t=0;t<e.length;t+=1){var n=e[t];if(ye(n)&&!Ft(n))return!1}return!0}var Ws=Gn(dt),Vs=(function(){function e(t,n,r){this.rules=t,this.staticRulesId="",this.isStatic=(r===void 0||r.isStatic)&&Ys(t),this.componentId=n,this.baseHash=he(Ws,n),this.baseStyle=r,Yn.registerId(n)}return e.prototype.generateAndInjectStyles=function(t,n,r){var o=this.baseStyle?this.baseStyle.generateAndInjectStyles(t,n,r):"";if(this.isStatic&&!r.hash)if(this.staticRulesId&&n.hasNameForId(this.componentId,this.staticRulesId))o=ce(o,this.staticRulesId);else{var s=vt(de(this.rules,t,n,r)),a=Rt(he(this.baseHash,s)>>>0);if(!n.hasNameForId(this.componentId,a)){var c=r(s,".".concat(a),void 0,this.componentId);n.insertRules(this.componentId,a,c)}o=ce(o,a),this.staticRulesId=a}else{for(var l=he(this.baseHash,r.hash),p="",d=0;d<this.rules.length;d++){var u=this.rules[d];if(typeof u=="string")p+=u;else if(u){var h=vt(de(u,t,n,r));l=he(l,h+d),p+=h}}if(p){var f=Rt(l>>>0);n.hasNameForId(this.componentId,f)||n.insertRules(this.componentId,f,r(p,".".concat(f),void 0,this.componentId)),o=ce(o,f)}}return o},e})(),Jn=oe.createContext(void 0);Jn.Consumer;var yt={};function Zs(e,t,n){var r=Ft(e),o=e,s=!xt(e),a=t.attrs,c=a===void 0?ut:a,l=t.componentId,p=l===void 0?(function(S,D){var v=typeof S!="string"?"sc":Zt(S);yt[v]=(yt[v]||0)+1;var R="".concat(v,"-").concat($n(dt+v+yt[v]));return D?"".concat(D,"-").concat(R):R})(t.displayName,t.parentComponentId):l,d=t.displayName,u=d===void 0?(function(S){return xt(S)?"styled.".concat(S):"Styled(".concat(Is(S),")")})(e):d,h=t.displayName&&t.componentId?"".concat(Zt(t.displayName),"-").concat(t.componentId):t.componentId||p,f=r&&o.attrs?o.attrs.concat(c).filter(Boolean):c,m=t.shouldForwardProp;if(r&&o.shouldForwardProp){var x=o.shouldForwardProp;if(t.shouldForwardProp){var y=t.shouldForwardProp;m=function(S,D){return x(S,D)&&y(S,D)}}else m=x}var I=new Vs(n,h,r?o.componentStyle:void 0);function b(S,D){return(function(v,R,pe){var Me=v.attrs,er=v.componentStyle,tr=v.defaultProps,nr=v.foldedComponentIds,rr=v.styledComponentId,or=v.target,sr=oe.useContext(Jn),ir=nn(),pt=v.shouldForwardProp||ir.shouldForwardProp,Gt=Es(R,sr,tr)||xe,q=(function(Ge,Ae,$e){for(var be,se=X(X({},Ae),{className:void 0,theme:$e}),ht=0;ht<Ge.length;ht+=1){var Be=ye(be=Ge[ht])?be(se):be;for(var te in Be)se[te]=te==="className"?ce(se[te],Be[te]):te==="style"?X(X({},se[te]),Be[te]):Be[te]}return Ae.className&&(se.className=ce(se.className,Ae.className)),se})(Me,R,Gt),ke=q.as||or,Te={};for(var ee in q)q[ee]===void 0||ee[0]==="$"||ee==="as"||ee==="theme"&&q.theme===Gt||(ee==="forwardedAs"?Te.as=q.forwardedAs:pt&&!pt(ee,ke)||(Te[ee]=q[ee]));var $t=(function(Ge,Ae){var $e=nn(),be=Ge.generateAndInjectStyles(Ae,$e.styleSheet,$e.stylis);return be})(er,q),ft=ce(nr,rr);return $t&&(ft+=" "+$t),q.className&&(ft+=" "+q.className),Te[xt(ke)&&!Mn.has(ke)?"class":"className"]=ft,pe&&(Te.ref=pe),E.createElement(ke,Te)})(C,S,D)}b.displayName=u;var C=oe.forwardRef(b);return C.attrs=f,C.componentStyle=I,C.displayName=u,C.shouldForwardProp=m,C.foldedComponentIds=r?ce(o.foldedComponentIds,o.styledComponentId):"",C.styledComponentId=h,C.target=r?o.target:e,Object.defineProperty(C,"defaultProps",{get:function(){return this._foldedDefaultProps},set:function(S){this._foldedDefaultProps=r?(function(D){for(var v=[],R=1;R<arguments.length;R++)v[R-1]=arguments[R];for(var pe=0,Me=v;pe<Me.length;pe++)Ot(D,Me[pe],!0);return D})({},o.defaultProps,S):S}}),Mt(C,function(){return".".concat(C.styledComponentId)}),s&&zn(C,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0}),C}function on(e,t){for(var n=[e[0]],r=0,o=t.length;r<o;r+=1)n.push(t[r],e[r+1]);return n}var sn=function(e){return Object.assign(e,{isCss:!0})};function z(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];if(ye(e)||Pe(e))return sn(de(on(ut,_e([e],t,!0))));var r=e;return t.length===0&&r.length===1&&typeof r[0]=="string"?de(r):sn(de(on(r,t)))}function _t(e,t,n){if(n===void 0&&(n=xe),!t)throw Le(1,t);var r=function(o){for(var s=[],a=1;a<arguments.length;a++)s[a-1]=arguments[a];return e(t,n,z.apply(void 0,_e([o],s,!1)))};return r.attrs=function(o){return _t(e,t,X(X({},n),{attrs:Array.prototype.concat(n.attrs,o).filter(Boolean)}))},r.withConfig=function(o){return _t(e,t,X(X({},n),o))},r}var Qn=function(e){return _t(Zs,e)},A=Qn;Mn.forEach(function(e){A[e]=Qn(e)});function Fe(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];var r=vt(z.apply(void 0,_e([e],t,!1))),o=$n(r);return new Zn(o,r)}let Ks=(e=21)=>crypto.getRandomValues(new Uint8Array(e)).reduce((t,n)=>(n&=63,n<36?t+=n.toString(36):n<62?t+=(n-26).toString(36).toUpperCase():n>62?t+="-":t+="_",t),"");const qs=e=>`${e}-${Ks()}`,Js=A.div`
  position: ${e=>e.$isEmbedded?"relative":"fixed"};
  bottom: ${e=>e.$isEmbedded?"0":"10px"};
  left: ${e=>e.$isEmbedded?"0":"10px"};
  width: ${e=>e.$isEmbedded?"100%":"calc(100% - 20px)"};
  max-width: ${e=>e.$isEmbedded?"none":"600px"};
  height: ${e=>e.$isEmbedded?"100%":"300px"};
  background-color: ${e=>e.$isEmbedded?"transparent":"rgba(20, 20, 20, 0.92)"};
  color: #0f0;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  border: ${e=>e.$isEmbedded?"none":"1px solid #444"};
  border-radius: ${e=>e.$isEmbedded?"0":"6px"};
  z-index: ${e=>e.$isEmbedded?"auto":"99999"};
  display: flex;
  flex-direction: column;
  pointer-events: auto;
`,Qs=A.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background-color: #222;
  border-bottom: 1px solid #333;
  font-size: 11px;
  font-weight: bold;
  color: #888;
`,ei=A.div`
  flex: 1;
  overflow-y: auto;
  padding-left: 8px;
  padding-right: 8px;
  margin-bottom: 50px;
  margin-top: 10px;
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
`,ti=A.div`
  font-size: 11px;
  line-height: 1.4;
  word-break: break-all;
  white-space: pre-wrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 2px;

  color: ${({$type:e})=>{switch(e){case"error":return"#ff6b6b";case"warn":return"#fcc419";case"info":return"#74c0fc";case"debug":return"#cc5de8";default:return"#51cf66"}}};

  &::before {
    content: "> ";
    opacity: 0.3;
  }
`,St=A.button`
  background: #333;
  border: none;
  color: #aaa;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    background: #444;
    color: #fff;
  }
`,ni=e=>e.map(t=>{if(t instanceof Error)return`${t.name}: ${t.message}
${t.stack}`;if(typeof t=="object"&&t!==null)try{return JSON.stringify(t,null,2)}catch{return"[Circular]"}return String(t)}).join(" "),ri=({isEmbedded:e})=>{const[t,n]=E.useState([]),[r,o]=E.useState(!1);return E.useEffect(()=>{const s={log:console.log.bind(console),error:console.error.bind(console),warn:console.warn.bind(console),info:console.info.bind(console),debug:console.debug.bind(console)},a=(c,...l)=>{n(p=>[{id:qs("log"),type:c,message:ni(l),time:new Date().toLocaleTimeString().split(" ")[0]??""},...p].slice(0,100))};return console.log=(...c)=>{s.log(...c),a("log",...c)},console.error=(...c)=>{s.error(...c),a("error",...c)},console.warn=(...c)=>{s.warn(...c),a("warn",...c)},console.info=(...c)=>{s.info(...c),a("info",...c)},console.debug=(...c)=>{s.debug(...c),a("debug",...c)},()=>{console.log=s.log,console.error=s.error,console.warn=s.warn,console.info=s.info,console.debug=s.debug}},[]),!e&&!r?i.jsx(St,{style:{position:"fixed",bottom:10,left:10,zIndex:99999},onClick:()=>o(!0),children:"CONSOLE"}):i.jsxs(Js,{$isEmbedded:e,children:[i.jsxs(Qs,{children:[i.jsx("span",{children:"OUTPUT LOG"}),i.jsxs("div",{children:[i.jsx(St,{onClick:()=>n([]),children:"CLEAR"}),!e&&i.jsx(St,{onClick:()=>o(!1),children:"HIDE"})]})]}),i.jsx(ei,{children:t.map(s=>i.jsxs(ti,{$type:s.type,children:[i.jsxs("span",{style:{opacity:.5,fontSize:"0.9em",marginRight:4},children:["[",s.time,"]"]}),s.message]},s.id))})]})},oi=A.div`
  padding: 12px;
  background: #252525;
  border-bottom: 1px solid #444;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  pointer-events: auto;
`,an=A.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #efefef;
  font-size: 12px;
  cursor: pointer;
  user-select: none;

  input {
    cursor: pointer;
  }
`,si=()=>{const{showGestureArea:e,showFps:t}=P.ui.useDebugSettings(),n=o=>{B.ui.updateDebugSettings({showGestureArea:o.target.checked})},r=o=>{B.ui.updateDebugSettings({showFps:o.target.checked})};return i.jsxs(oi,{children:[i.jsxs(an,{children:[i.jsx("input",{type:"checkbox",checked:e,onChange:n}),i.jsx("span",{children:"Gesture Area 🟢"})]}),i.jsxs(an,{children:[i.jsx("input",{type:"checkbox",checked:t,onChange:r}),i.jsx("span",{children:"Show FPS 📈"})]})]})},ii=A.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: calc(100% - 40px);
  max-width: 650px;
  height: ${e=>e.$isOpen?"450px":"0px"};
  /* ✨ 修正: 背景色の不透明度を維持し、blurを削除 */
  background-color: rgba(15, 15, 15, 0.96);
  /* backdrop-filter: blur(12px); <-- GPU負荷軽減のため削除 */

  border: ${e=>e.$isOpen?"1px solid #00ff0044":"none"};
  border-radius: 12px;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
  pointer-events: auto; /* ✨ クリックを有効化 */
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: ${e=>e.$isOpen?1:0};
  transform: translateY(${e=>e.$isOpen?"0":"20px"});
`,ai=A.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100001;
  background: #000;
  color: #0f0;
  border: 1px solid #0f0;
  padding: 8px 16px;
  font-size: 12px;
  font-family: "Fira Code", monospace;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  pointer-events: auto; /* ✨ クリックを有効化 */

  &:hover {
    background: #0a250a;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  }
`,ci=A.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  color: #0f0;
  font-size: 12px;
  font-family: monospace;
  font-weight: bold;
`,li=A.button`
  background: none;
  border: 1px solid #444;
  color: #888;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  &:hover {
    color: #fff;
    border-color: #666;
  }
`,di=A.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`,ui=()=>{const[e,t]=E.useState(!1);return i.jsxs(i.Fragment,{children:[!e&&i.jsxs(ai,{onClick:()=>t(!0),children:[">"," DEBUG DASHBOARD"]}),i.jsxs(ii,{$isOpen:e,children:[i.jsxs(ci,{children:[i.jsx("span",{children:"TERMINAL :: DEBUG_MODE"}),i.jsx(li,{onClick:()=>t(!1),children:"MINIMIZE"})]}),i.jsxs(di,{children:[i.jsx(si,{}),i.jsx(ri,{isEmbedded:!0})]})]})]})},pi={key:"debug-console",init:()=>(console.log("[Feature] Debug Dashboard Initialized"),()=>{}),renderUI:e=>e==="ui-overlay"?i.jsx(ui,{}):null},Xe={WIDTH_OPEN:"260px",WIDTH_CLOSED:"80px",OFFSET:"0px"},fi="240px",hi=A.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: ${({$isOpen:e})=>e?Xe.WIDTH_OPEN:Xe.WIDTH_CLOSED};
  height: auto;
  min-height: 200px;
  z-index: 100;
  pointer-events: none; /* コンテナ自体は透過 */
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  ${({$position:e})=>e==="left"?z`
          left: ${Xe.OFFSET};
          /* 左側（Native/後攻）は対面用に180度回転 */
          .content-rotator {
            transform: rotate(180deg);
          }
        `:z`
          right: ${Xe.OFFSET};
        `}
`,gi=A.div`
  pointer-events: auto;
  /* ✨ 修正: backdrop-filterを廃止し、不透明度を上げて視認性を確保 (0.85 -> 0.95) */
  background: rgba(20, 20, 20, 0.95);
  /* backdrop-filter: blur(12px); <-- GPU負荷軽減のため削除 */

  /* デフォルトのボーダーまたはアクティブ時のボーダー */
  border: 1px solid
    ${({$isActive:e,$accentColor:t})=>e&&t?t:"rgba(255, 255, 255, 0.1)"};

  border-radius: ${({$position:e})=>e==="left"?"0 12px 12px 0":"12px 0 0 12px"};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* アクティブ時は発光効果を追加、非アクティブ時は通常の影のみ */
  box-shadow: ${({$isActive:e,$accentColor:t})=>e&&t?`0 0 15px ${t}66, 0 8px 32px rgba(0, 0, 0, 0.5)`:"0 8px 32px rgba(0, 0, 0, 0.5)"};

  overflow: hidden;
  transition: all 0.3s ease;

  /* 閉じたときの中身の制御 */
  ${({$isOpen:e})=>!e&&z`
      align-items: center;
      padding: 15px 5px;
    `}
`,mi=A.div`
  width: 100%;
  /* 開いている時は、コンテナが伸びている途中でも中身の幅を確保する */
  ${({$isOpen:e})=>e&&z`
      min-width: ${fi};
    `}
`,Ei=A.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 8px;
  font-size: 10px;
  text-transform: uppercase;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`,cn=({position:e,isActive:t,accentColor:n,children:r})=>{const[o,s]=E.useState(!1);return i.jsx(hi,{$position:e,$isOpen:o,children:i.jsx("div",{className:"content-rotator",style:{width:"100%",height:"100%"},children:i.jsxs(gi,{$position:e,$isOpen:o,$isActive:t,$accentColor:n,children:[i.jsx(Ei,{onClick:()=>s(!o),children:o?e==="left"?"< CLOSE":"CLOSE >":e==="left"?"MENU >":"< MENU"}),i.jsx(mi,{$isOpen:o,children:r(o)})]})})})},kt=A.button`
  flex-grow: 1;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 10px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease-in-out;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  width: 100%;

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: #757575;
    color: #bdbdbd;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    opacity: 0.7;
  }
`;A.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;const ln=A.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: white;
  font-family: "Inter", sans-serif;
`,xi=A.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;

  .name {
    font-weight: 800;
    font-size: ${({$compact:e})=>e?"0.9rem":"1.15rem"};
    color: ${({$color:e})=>e};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`,yi=A.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .current-score {
    font-family: "Fira Code", monospace;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
  }

  .opponent-score {
    font-family: "Fira Code", monospace;
    font-size: 0.8rem;
    color: #999;
    margin-top: 2px;
  }
`,Si=A.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #ccc;
`,Ii=A.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 4px;
  overflow: hidden;
`,Ci=A.div`
  height: 100%;
  width: ${({$percent:e})=>e}%;
  background: ${({$color:e})=>e};
  transition: width 0.5s ease-out;
`,Ti=A.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`,dn=A(kt)`
  font-size: 0.9rem;
  padding: 10px;
  margin-top: 5px;
  background: ${({$isActive:e,$themeColor:t})=>e?t:"#333"};
  border: ${({$isActive:e,$themeColor:t})=>e?`1px solid ${t}`:"1px solid #555"};

  ${({$isActive:e})=>!e&&z`
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    `}
`,un=({playerId:e,isOpen:t})=>{const n=P.usePlayer(e),r=P.useScore(e),o=e==="alien"?"native":"alien",s=P.useScore(o),a=o==="alien"?"外来種":"在来種",c=P.useActivePlayer(),l=P.useCurrentRound(),p=c===e,d=e==="alien"?"#E57373":"#66BB6A";if(!n)return null;const u=n.currentEnvironment/n.maxEnvironment*100,h=()=>{if(!p){B.ui.notify({message:"相手のターンです",type:"error",player:e});return}B.turn.end()},f=i.jsxs(Ti,{children:[i.jsxs(Si,{children:[i.jsx("span",{style:{fontSize:t?"0.85rem":"0.7rem"},children:t?"エンバイロメント (AP)":"AP"}),i.jsxs("span",{style:{fontWeight:"bold",color:"white",fontSize:t?"0.85rem":"0.75rem"},children:[n.currentEnvironment," / ",n.maxEnvironment]})]}),i.jsx(Ii,{children:i.jsx(Ci,{$percent:u,$color:d})})]});return t?i.jsxs(ln,{children:[i.jsxs(xi,{$color:d,$compact:!1,children:[i.jsx("div",{className:"name",children:n.playerName}),i.jsxs(yi,{children:[i.jsxs("div",{className:"current-score",children:[r," 点"]}),i.jsxs("div",{className:"opponent-score",children:[a,": ",s," 点"]})]})]}),f,i.jsx(dn,{$isActive:p,$themeColor:d,onClick:h,disabled:!p,children:p?`ターン終了 (R${l})`:"相手のターン中..."})]}):i.jsxs(ln,{children:[i.jsxs("div",{style:{textAlign:"center"},children:[i.jsx("div",{style:{fontSize:"0.7rem",color:d,fontWeight:"bold",marginBottom:"4px"},children:e==="alien"?"外来種":"在来種"}),i.jsxs("div",{style:{fontSize:"1.2rem",fontWeight:"bold",marginBottom:"8px"},children:[r," 点"]})]}),f,p&&i.jsx(dn,{$isActive:!0,$themeColor:d,onClick:h,style:{padding:"6px",fontSize:"0.7rem",marginTop:"8px"},children:"終了"})]})},Ai=()=>{const{isGameOver:e}=P.useGameState(),t=P.useCurrentRound(),n=P.useActivePlayer(),r="#66BB6A",o="#E57373";return t===0||e?null:i.jsxs(i.Fragment,{children:[i.jsx(cn,{position:"left",isActive:n==="native",accentColor:r,children:s=>i.jsx(un,{playerId:"native",isOpen:s})}),i.jsx(cn,{position:"right",isActive:n==="alien",accentColor:o,children:s=>i.jsx(un,{playerId:"alien",isOpen:s})})]})},bi={key:"info-hud",renderUI:e=>e==="ui-overlay"?i.jsx(Ai,{}):null},Ri=Fe`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`,vi=Fe`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-50%); opacity: 0; }
`,Oi=A.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000; /* 最前面 */
  pointer-events: none; /* 下の要素を触れるようにコンテナ自体はスルー */

  /* ✨ 修正: プレイヤー視点に合わせて配置と回転を切り替える */
  ${({$isInverted:e})=>e?z`
          /* 在来種(相手)視点: 画面右下に配置して180度回転 => 相手から見て左上 */
          bottom: calc(100vh / 2.5);
          right: 20px;
          transform: rotate(180deg);
        `:z`
          /* 外来種(自分)視点: 画面左上に配置 */
          top: calc(100vh / 2.5);
          left: 20px;
          transform: none;
        `}

  /* 回転の中心はボックスの中心 */
  transform-origin: center;
  transition: all 0.5s ease-in-out;
`,wi=A.div`
  background: ${({$type:e})=>e==="error"?"rgba(211, 47, 47, 0.9)":e==="success"?"rgba(56, 142, 60, 0.9)":"rgba(25, 118, 210, 0.9)"};
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  min-width: 250px;
  max-width: 400px;

  /* ✨ 修正: インタラクションを有効化 */
  pointer-events: auto;
  cursor: pointer;
  user-select: none;

  /* Animation */
  animation: ${({$isExiting:e})=>e?z`
          ${vi} 0.3s ease-in forwards
        `:z`
          ${Ri} 0.3s ease-out forwards
        `};

  &:active {
    filter: brightness(0.9);
  }
`,_i=({item:e})=>{const t=O(l=>l.removeNotification),[n,r]=E.useState(!1),o=E.useRef(null);E.useEffect(()=>{if(n)return;const l=e.type==="error"?4e3:2500,p=setTimeout(()=>{r(!0)},l);return()=>{clearTimeout(p)}},[e.type,n]),E.useEffect(()=>{if(!n)return;const l=setTimeout(()=>{t(e.id)},300);return()=>clearTimeout(l)},[n,e.id,t]);const s=()=>{r(!0)},a=l=>{o.current=l.touches[0].clientX},c=l=>{if(o.current===null)return;const p=l.changedTouches[0].clientX;o.current-p>50&&r(!0),o.current=null};return i.jsxs(wi,{$type:e.type,$isExiting:n,onClick:s,onTouchStart:a,onTouchEnd:c,children:[i.jsx("div",{style:{fontWeight:"bold",marginBottom:"4px"},children:e.type.toUpperCase()}),i.jsx("div",{children:e.message})]})},Pi=()=>{const e=O(s=>s.notifications),t=O(s=>s.clearNotifications),n=P.useActivePlayer(),r=E.useRef(n);E.useEffect(()=>{r.current!==n&&(t(),r.current=n)},[n,t]);const o=n==="native";return i.jsx(Oi,{$isInverted:o,children:e.map(s=>i.jsx(_i,{item:s},s.id))})},Di={key:"info-alert",renderUI:e=>e==="ui-overlay"?i.jsx(Pi,{}):null},Ni=Fe`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`,ji=Fe`
  0% { opacity: 1; }
  100% { opacity: 0; }
`,Li=A.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  z-index: 150;
  pointer-events: none;
  display: flex;
  align-items: center; /* 垂直中央配置 */
  justify-content: center; /* 水平中央配置 */

  ${({$side:e})=>e==="top"?z`
          top: 0;
          transform: rotate(180deg);
        `:z`
          bottom: 0;
        `}
`,Fi=A.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 40px 0;

  /* アニメーション制御 */
  animation: ${({$isExiting:e})=>e?z`
          ${ji} 0.5s ease-in forwards
        `:z`
          ${Ni} 0.3s ease-out forwards
        `};
`,Mi=A.h2`
  font-size: 2.5rem;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  margin: 0;
  padding: 10px 40px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 2px solid white;
  border-bottom: 2px solid white;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
`,ki=A.div`
  font-size: 1.2rem;
  color: #ddd;
  margin-top: 10px;
  font-weight: bold;
`,pn=({side:e,message:t,subMessage:n,isExiting:r})=>i.jsx(Li,{$side:e,children:i.jsxs(Fi,{$isExiting:r,children:[i.jsx(Mi,{children:t}),n&&i.jsx(ki,{children:n})]})}),Gi=()=>{const{isGameOver:e}=P.useGameState();P.useActivePlayer();const[t,n]=E.useState(!1),[r,o]=E.useState(!1),[s,a]=E.useState({message:"",subMessage:""}),c=E.useRef(null),l=E.useRef(null),p=E.useRef(null),d=h=>h==="alien"?"外来種":"在来種",u=(h,f)=>{c.current&&clearTimeout(c.current),l.current&&clearTimeout(l.current),a({message:h,subMessage:f}),n(!0),o(!1),c.current=setTimeout(()=>{o(!0),l.current=setTimeout(()=>{n(!1)},500)},2e3)};return E.useEffect(()=>{if(e)return;const h=m=>{const y=m.round===Q.MAXIMUM_ROUNDS?"FINAL ROUND":`ROUND ${m.round}`;u(y,""),p.current&&clearTimeout(p.current),p.current=setTimeout(()=>{u(`${d("alien")}のターン`,"Turn Start")},2800)},f=m=>{p.current&&clearTimeout(p.current),u(`${d(m.playerId)}のターン`,"Turn Action")};return H.on("ROUND_START",h),H.on("PLAYER_ACTION_START",f),()=>{H.off("ROUND_START",h),H.off("PLAYER_ACTION_START",f),c.current&&clearTimeout(c.current),l.current&&clearTimeout(l.current),p.current&&clearTimeout(p.current)}},[e]),t?i.jsxs(i.Fragment,{children:[i.jsx(pn,{side:"top",message:s.message,subMessage:s.subMessage,isExiting:r}),i.jsx(pn,{side:"bottom",message:s.message,subMessage:s.subMessage,isExiting:r}),i.jsx("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:140,pointerEvents:"auto"}})]}):null},$i={key:"info-banner",renderUI:e=>e==="ui-overlay"?i.jsx(Gi,{}):null},Bi=A.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  z-index: 100;
  pointer-events: auto;
  border-bottom: 1px solid #333;
  border-top: 2px solid;
  ${({$side:e})=>e==="top"?"top: 0; transform: rotate(180deg);":"bottom: 0;"}
`,Hi=A.h1`
  font-size: 3rem; /* 少しサイズ調整 */
  background: linear-gradient(180deg, #36d63eff, #162716ff);
  margin-bottom: 1rem;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
  text-align: center;
  white-space: pre-wrap;
`,Ui=A.h2`
  margin-bottom: 5rem;
  margin-top: 0;
  font-size: 2.5rem;
  color: #aaa;
`,fn=({side:e,onStart:t})=>i.jsxs(Bi,{$side:e,children:[i.jsx(Hi,{children:"『侵緑』"}),i.jsx(Ui,{children:"~外来種vs在来種陣取りゲーム~"}),i.jsx("div",{children:i.jsx(kt,{onClick:t,style:{padding:"15px 35px",fontSize:"1.5rem",backgroundColor:"#2E7D32",border:"1px solid #4CAF50"},children:"ゲーム開始"})})]}),zi=Fe`
  from { opacity: 0; }
  to { opacity: 1; }
`,Xi=A.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  z-index: 200;
  pointer-events: auto;
  border-top: 4px solid ${({$resultColor:e})=>e};
  animation: ${zi} 0.5s ease-out forwards;

  ${({$side:e})=>e==="top"?"top: 0; transform: rotate(180deg);":"bottom: 0;"}
`,Yi=A.h1`
  font-size: 3rem;
  color: ${({$color:e})=>e};
  margin-bottom: 10px;
  text-shadow: 0 0 15px ${({$color:e})=>e}80;
`,Wi=A.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  min-width: 200px;
`,hn=A.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;

  &.total {
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    margin-top: 5px;
    padding-top: 5px;
    font-weight: bold;
  }
`,gn=({side:e,playerId:t,onRestart:n})=>{const{winningPlayerId:r,alienScore:o,nativeScore:s}=P.useGameState(),a=r===t,c=r===null,l=a?"YOU WIN!":c?"DRAW":"YOU LOSE...",p=a?"#4CAF50":c?"#FFC107":"#F44336";return i.jsxs(Xi,{$side:e,$resultColor:p,children:[i.jsx(Yi,{$color:p,children:l}),i.jsxs(Wi,{children:[i.jsxs(hn,{children:[i.jsx("span",{style:{color:"#E91E63"},children:"Alien"}),i.jsx("span",{children:o})]}),i.jsxs(hn,{children:[i.jsx("span",{style:{color:"#4CAF50"},children:"Native"}),i.jsx("span",{children:s})]})]}),i.jsx("div",{children:i.jsx(kt,{onClick:n,style:{padding:"15px 35px",fontSize:"1.5rem",backgroundColor:"#2E7D32",border:"1px solid #4CAF50"},children:"タイトルに戻る"})})]})},Vi=()=>{const{isGameOver:e}=P.useGameState(),[t,n]=oe.useState(!1),r=()=>{n(!0),H.emit("ROUND_START",{round:1})},o=()=>{B.system.reset(),n(!1)};return t?e?i.jsxs(i.Fragment,{children:[i.jsx(gn,{side:"top",playerId:"native",onRestart:o}),i.jsx(gn,{side:"bottom",playerId:"alien",onRestart:o})]}):null:i.jsxs(i.Fragment,{children:[i.jsx(fn,{side:"top",onStart:r}),i.jsx(fn,{side:"bottom",onStart:r})]})},Zi={key:"info-scene",renderUI:e=>e==="ui-overlay"?i.jsx(Vi,{}):null},mn=[So,Xo,Ko,Uo,Ho,bi,$i,Zi,Di,pi],Ki=()=>{E.useEffect(()=>{Vr();const t=r=>{r.preventDefault()};window.addEventListener("contextmenu",t);const n=[];return mn.forEach(r=>{if(r.init){const o=r.init();typeof o=="function"&&n.push(o)}}),()=>{window.removeEventListener("contextmenu",t),n.forEach(r=>r())}},[]);const e=t=>i.jsx(i.Fragment,{children:mn.map(n=>i.jsx(oe.Fragment,{children:n.renderUI(t)},n.key))});return i.jsx(jr,{uiOverlay:e("ui-overlay"),children:e("main-3d")})},qi=()=>i.jsx("style",{children:`
    body, html {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: #000;
      font-family: 'MPLUS1p-Regular', sans-serif;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;

      /* ✨ 追加: ブラウザによる自動のズームやスクロールなどのジェスチャーを無効化 */
      touch-action: none;
    }
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
  `});Er.createRoot(document.getElementById("root")).render(i.jsxs(oe.StrictMode,{children:[i.jsx(qi,{}),i.jsx(Ki,{})]}));
