import * as React from "react"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import TableEdit from "./TableEdit"

import "./index.less"

export default function Table(props) {
    //获取行、列数
    const {cols,rows} = props.controlData.tableAmount;
    //获取api、参数
    const api = props.controlData.dataFrom.api;
    const apiParameter = props.controlData.dataFrom.parameter;

    //用来控制右键菜单是否可见的状态
    const [visable, setVisable] = useState("none")
    
    //获取当前右键点击的 td 或 tr 位置
    const [tdIndex, setTdIndex] = useState(null)
    const [trIndex, setTrIndex] = useState(null)

    //右键菜单的ref
    const rightPanel = useRef(null)
    //tbody的ref
    const tbody = useRef(null)

    const originData = [
        {"gender":"表","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com"},
        {"gender":"格","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com"},
        {"gender":"工","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com"},
        {"gender":"具","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com"},
        {"gender":"具","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com"}
    ]
    //表头，这里用参数来确定
    const [defaultHead,setDefaultHead] = useState(apiParameter.split(","));
    //要渲染的表头
    const [renderHead, setRenderHead] = useState(apiParameter.split(","))
    //初始列的最大值
    const [longestHead, setLongestHead] = useState(apiParameter.split(","))
    //初始数据
    const [defaultData, setDefaultData] = useState(originData)
    //初始数据的最大值
    const longestData = originData;
    //初始渲染数据
    const [renderData, setRenderData] = useState([]);
    const [originHead,setOriginHead] = useState(apiParameter.split(","))

    React.useEffect(() => {
        setOriginHead(apiParameter.split(","))
        //fetch请求成功后更新 defaultData
        fetch(api+apiParameter)
        .then((response) => response.json())
        .then((json) => {
            setDefaultData(json.results);
            // console.log("ddd")
        });
    },[api,apiParameter])

    //api,apiParameter更新，originHead随之更新；
    React.useEffect(() => {
        //apiParameter 更新。与最长 head 做对比。
        setDefaultHead(originHead);

    }, [cols,rows,originHead])

    // renderHead, defaultData 更新
    React.useEffect(()=>{
        //defaultData 更新时，如果defaultData的长度大于，历史最大长度，则历史最大长度等于 defaultData

        let copyDefaultData = defaultData.slice();  
        let copyLongestData = longestData.slice();
        
        let copyDefaultHead = defaultHead.slice();
        let copyLongestHead = longestHead.slice();


        //更新 Head 数据
        let deleteItemArr = [];

        //替换copyLongestHead中的非 "" 元素为 ""，并记录元素的位置
        for(let i=0;i<copyLongestHead.length;i++){
            if(copyLongestHead[i]!==""){
                    copyLongestHead.splice(i,1,"");
                    deleteItemArr.push(i)
            }
        }
        //在之前删除的位置重新写入 originHead 内容，如果originHead的长度大于删除内容的长度，就在最后替换的位置上依次加入剩余内容。
        for(let i=0;i<copyDefaultHead.length;i++){
            if(i < deleteItemArr.length){
                copyLongestHead.splice(deleteItemArr[i],1,copyDefaultHead[i]);
            }else{
                //["","","最后那个位置",""]在最后的那个位置上(deleteItemArr[deleteItemArr.length-1])的下一个位置上（i-deleteItemArr.length+1）,
                copyLongestHead.splice(deleteItemArr[deleteItemArr.length-1]+(i-deleteItemArr.length+1),1,copyDefaultHead[i]);
            }
        }
        // setLongestHead(copyLongestHead);
        console.log(copyLongestHead)
        // 此时的 copyLongestHead 记录了更新后的最长表头

        //更新数据的最大值
        let deleteObjArr = [];
        //替换copyLongestData中的非 "" 元素为 ""，并记录元素的位置
        for(let i=0;i<copyLongestData.length;i++){
            if(copyLongestData[i] !== ""){
                    copyLongestData.splice(i,1,{});
                    deleteObjArr.push(i)
            }
        }
        //在之前删除的位置重新写入 originHead 内容，如果originHeadData的长度大于删除内容的长度，就在最后替换的位置上依次加入剩余内容。
        for(let i=0;i<copyDefaultData.length;i++){
            if(i < deleteObjArr.length){
                copyLongestData.splice(deleteObjArr[i],1,copyDefaultData[i]);
            }else{
                //["","","最后那个位置",""]在最后的那个位置上(deleteObjArr[deleteObjArr.length-1])的下一个位置上（i-deleteObjArr.length+1）,
                copyLongestData.splice(deleteObjArr[deleteObjArr.length-1]+(i-deleteObjArr.length+1),1,copyDefaultData[i]);
            }
        }
        // setLongestData(copyLongestData);
        // 此时的 copyLongestData 记录了更新后的最长数据


        //准备更新数据
        let readyRenderHead = cols < copyLongestHead.length ? copyLongestHead.slice(0,cols) : copyLongestHead.concat(Array(cols-copyLongestHead.length).fill(""));
        let readyRenderData = rows < copyLongestData.length ? copyLongestData.slice(0,rows) : copyLongestData.concat(Array(rows-copyLongestData.length).fill({}));

        // 整合数据, 用的是 传过来的 defaultHead 数据。
        let mergedData = [];

        for(let i=0;i<readyRenderData.length;i++){
            //定义一个行为空对象
            let row = {};
            
            //根据设置的列数来循环，以此确定将要往 row 这个空对象中添加多少个 key:value
            for(let j=0;j<readyRenderHead.length;j++){
                //如果 copyRenderHead 中的 item 为空，就用它的索引作为 key
                if(readyRenderHead[j] === ""){
                    row[j] = "";
                }else{
                    row[readyRenderHead[j]] = "";
                }
            }

            if(Object.keys(readyRenderData[i]).length !== 0){
                Object.assign(row, readyRenderData[i]);
            }
            
            //将对象放入 copyRenderData 中
            mergedData.push(row);
        }  
        console.log(mergedData)
        
        
        setRenderHead(readyRenderHead)
        setRenderData(readyRenderData)

    },[cols,rows,defaultHead,defaultData])
    
    //自定义右键菜单
    function forRight(e) {
        //阻止鼠标右键的默认行为
        e.preventDefault()
        //通过修改状态来隐藏或显示右键菜单
        setVisable("block")
        //获取当前鼠标的 x 坐标
        const clickX = e.clientX
        //获取当前鼠标的 y 坐标
        const clickY = e.clientY
        //为 右键菜单 标记了 refs 标签。这里引用并设置右键菜单的位置
        //（已经设置 ul 的 position 为 absolute ）。current 是必须要引用的
        rightPanel.current.style.left = clickX + 2 + "px"
        rightPanel.current.style.top = clickY + 2 + "px"
        //获取点击的td
        let currentTd = e.target.tagName === "TD" ? e.target : e.target.parentNode;
        //获取点击的tr
        let currentTr = e.target.tagName === "TD" ? e.target.parentNode : e.target.parentNode.parentNode;
        //获取所有的tds
        let tds = currentTr.childNodes
        //获取所有的trs
        let trs = currentTr.parentNode.childNodes
        //获取当前 td 所处的位置.先将 tds 转换为数组，再用 indexOf 方法获取当前 td 的位置
        setTdIndex(Array.from(tds).indexOf(currentTd))
        //获取当前 tr 所处的位置
        setTrIndex(Array.from(trs).indexOf(currentTr))
        //为 document 添加一个全局点击事件，用来隐藏右键菜单
        document.addEventListener("click",handleDocument)
    }

    function getValue(name,value){
        let tableAmount = props.controlData.tableAmount
        props.getDetails("tableAmount",{...tableAmount,[name]:value})
    }

    //隐藏右键
    function handleDocument(){
        setVisable("none")
        //隐藏后移除该事件。
        document.removeEventListener("click",handleDocument)
    }

    //在选中元素的上方插入行
    function addRowOnTop() {
        let insert = renderData.slice()
        //已知当前tr的位置，在tr数组中插入一个空数组即可
        insert.splice(trIndex, 0, {})
        //renderData的长度，状态发生改变，render 重新渲染，页面更新。
        //而调用上方的 createTr() 只是向dom中插入节点元素，添加固定多的td(根据添加时renderHead的长度)。在插入列后，页面刷新，但是插入的tr是孤立的，不会进入rowLength.map()方法中。td数量也被写死了，不会再发生改变。因此会出现断行。而插入数组会改变renderData的长度，他会在渲染时重新计算有多少个tr及内部的td
        setDefaultData(insert);
        setVisable("none");
        getValue("rows",insert.length);
    }

    //在选中元素的下方插入行
    function addRowOnBottom() {
        let insert = renderData.slice()
        insert.splice(trIndex + 1, 0, {})
        setDefaultData(insert);
        setVisable("none")
        getValue("rows",insert.length)
    }

    //移除该行
    function removeCurrentTr() {
        let insert = renderData.slice()
        insert.splice(trIndex, 1)
        setDefaultData(insert);
        // setLongestData(insert);
        setVisable("none")
        getValue("rows",insert.length)
    }

    //在选中元素的右方插入列
    function addColRight() {
        let insert = renderHead.slice()
        //现在已知点击的 td 位置 tdIndex，只需要在 renderHead 的对应位置加入一个空数组即可
        insert.splice(tdIndex + 1, 0, "") //返回删除值，这里没有删除任何内容，所有不能将它直接放入 setRenderHead()中。需要先执行splice然后将结果再放入setRenderHead()中
        // setOriginHead(insert);
        setLongestHead(insert);
        setVisable("none")
        getValue("cols",insert.length)
        console.log(insert.length)
    }

    //在选中元素的左方插入列
    function addColLeft() {
        //不要修改原数组。可以通过slice(),拷贝一份。
        let insert = renderHead.slice()
        //现在已知点击的 td 位置 tdIndex，只需要在 renderHead 的对应位置加入一个空数组即可
        insert.splice(tdIndex, 0, "") //返回删除值，这里没有删除任何内容，所有不能将它直接放入 setRenderHead()中。需要先执行splice然后将结果再放入setRenderHead()中
        // setOriginHead(insert);
        setLongestHead(insert);
        //点击后隐藏右键菜单
        setVisable("none")
        getValue("cols",insert.length)
    }

    //移除该列
    function removeCurrentCol() {
        let insert = renderHead.slice()
        insert.splice(tdIndex, 1)
        // setOriginHead(insert);
        setLongestHead(insert);
        getValue("cols",insert.length);
        // setLongestHead(insert);
        setVisable("none")
    }

    const {top,right,bottom,left} = props.controlData.padding

    return (
        <div>
            {/* 这里创建右键菜单，默认隐藏 */}
            <div ref={rightPanel} >
                <TableEdit 
                    display={visable}
                    addRowOnTop={addRowOnTop} 
                    addRowOnBottom={addRowOnBottom}
                    addColLeft={addColLeft}
                    addColRight={addColRight}
                    removeCurrentTr={removeCurrentTr}
                    removeCurrentCol={removeCurrentCol}
                />
            </div>

            <table style={props.style}>
                <thead>
                    <tr key={uuidv4()}>
                        {renderHead.map((cell) => {
                            return <th key={uuidv4()}>{cell}</th>
                        })}
                    </tr>
                </thead>
                <tbody ref={tbody}>
                    {renderData.map((perObject) => {
                        return (
                            <tr key={uuidv4()}>
                                {renderHead.map((cell) => {
                                    return (
                                        <td
                                            style={{
                                                backgroundColor:props.controlData.fill.basicColor,
                                                borderColor:props.controlData.border.basicColor
                                            }}
                                            onContextMenu={forRight}
                                            key={uuidv4()}
                                        >
                                            <input type="text" 
                                                defaultValue={perObject[cell]} 
                                                style={{
                                                    color:props.controlData.textStyle.basicColor,
                                                    fontSize:props.controlData.textStyle.fontSize+"px",
                                                    paddingTop:top+"px",
                                                    paddingRight:right+"px",
                                                    paddingBottom:bottom+"px",
                                                    paddingLeft:left+"px"
                                                }}/>
                                            {/* {perObject[cell]} */}
                                        </td>
                                    )
                                    // return <td key={index}>{perObject}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}