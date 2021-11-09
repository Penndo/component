import {useReducer} from 'react'
const initialState = {count:0}
//定义 reducer 方法，方法接受两个参数，一个state,一个action（action 是用来收集事件状态和
//事件值的一个普通对象）
function reducer(state, action){
	switch(action.type){
		case 'increment':
			console.log(state)
			return {count: state.count + 1}
		case 'decrement':
			return {count: state.count - 1}
	}
	console.log(state)
}

export default function Counter(){
	const [acc, dispatch] = useReducer(reducer, initialState)
	return(
		<div>
			Count:{acc.count}
			<button onClick = {()=>{dispatch({type:'increment'})}}>+</button>
			<button onClick = {()=>{dispatch({type:'decrement'})}}>-</button>
		</div>
	)
}