import * as React from "react";
import { useRef, useState} from "react";
import styles from "./index.module.less"

export default function TableCell(props) {
    const {dragSelectCells,getDragSelectCells,clipboard,forRight,renderHead,renderData,changeValue,table_ref,eventPosition,getTdIndex,getTrIndex,getLastSelectedTdIndex,getLastSelectedTrIndex} = props

    const [inputStyleName,setInputStyleName] = useState("input");

    function focus_cell(e) {
        const {trIndex,tdIndex} = eventPosition(e);
        getTdIndex(tdIndex);
        getTrIndex(trIndex);
        getLastSelectedTdIndex(tdIndex);
        getLastSelectedTrIndex(trIndex);
    }

    function selectCells_first(e){
        const {trIndex,tdIndex} = eventPosition(e);
        if(e.button === 0 && inputStyleName !== "focusInput"){
            getDragSelectCells(true);
        }else{
            getDragSelectCells(false);
        }
        getTdIndex(tdIndex);
        getTrIndex(trIndex);
        getLastSelectedTdIndex(tdIndex);
        getLastSelectedTrIndex(trIndex);
        
    }

    function selectCells_another(e) {
        const {trIndex,tdIndex} = eventPosition(e);
        if(dragSelectCells){
            console.log("123")
            getLastSelectedTrIndex(trIndex);
            getLastSelectedTdIndex(tdIndex);
        }
    }

    function keyDown(e) {
        console.log(e)
        const {trIndex,tdIndex} = eventPosition(e);
        let rows = table_ref.current.rows
        let maxRows = renderData.length
        let maxCols = renderHead.length
        let cell = rows[trIndex].childNodes[tdIndex].lastChild;

        //不同方式的聚焦，输入框样式表现不同
        function focusInput(styleName,cursorPositon){
            cell.disabled = false;
            cell.focus();
            setInputStyleName(styleName)
            if(cursorPositon){
                cell.selectionStart = cursorPositon;
                cell.selectionEnd = cursorPositon;
            }else{
                cell.select();
            }
        }

        if(e.target.tagName === "INPUT" && (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40)){
            //切换聚焦点
            switch (e.keyCode) {
                case 9:
                    e.preventDefault();
                    if(trIndex === maxRows && tdIndex === maxCols -1){
                        cell = rows[0].childNodes[0].lastChild
                    }else if(tdIndex === maxCols -1){
                        cell = rows[trIndex + 1].childNodes[0].lastChild
                    }else{
                        cell = rows[trIndex].childNodes[tdIndex+1].lastChild;
                    }
                    focusInput("input");
                    break;
                case 13:
                    e.preventDefault();
                    if(inputStyleName === "input"){
                        cell = rows[trIndex].childNodes[tdIndex].lastChild;
                        const cursorPositon = cell.value.length;
                        focusInput("focusInput",cursorPositon)            
                    }else{
                        if(trIndex === maxRows && tdIndex === maxCols - 1){
                            cell = rows[0].childNodes[0].lastChild;
                        }else if(trIndex === maxRows){
                            cell = rows[0].childNodes[tdIndex+1].lastChild;
                        }else{
                            cell = rows[trIndex+1].childNodes[tdIndex].lastChild;
                        }
                        focusInput("input");
                    }
                    break;
                case 37:
                    if(tdIndex !== 0 && inputStyleName !== "focusInput"){
                        e.preventDefault();
                        cell = rows[trIndex].childNodes[tdIndex-1].lastChild;
                        focusInput("input");
                    }
                    break;
                case 38:
                    if(trIndex !== 0){
                        cell = rows[trIndex - 1].childNodes[tdIndex].lastChild;
                    }
                    focusInput("input");
                    break;
                case 39:
                    if(tdIndex !== maxCols - 1 && inputStyleName !== "focusInput"){
                        e.preventDefault();
                        cell = rows[trIndex].childNodes[tdIndex + 1].lastChild;
                        focusInput("input");
                    }
                    break;
                case 40:
                    if(trIndex !== maxRows){
                        cell = rows[trIndex + 1].childNodes[tdIndex].lastChild
                    }
                    focusInput("input");
                    break;
                default:
                    focusInput("focusInput");
                    break;
            }
        }else if(e.code === "Escape" || e.code === "CapsLock" || e.code === "ShiftRight" || e.code === "ShiftLeft" || e.code === "ControlLeft" || e.code === "AltRight" || e.code === "MetaLeft" || e.code === "MetaRight" || e.code === "Unidentified"){
            return;
        }else{
            setInputStyleName("focusInput")
            return;
        }
    }

    function blur_inputBox(e) {
        e.target.disabled = true
        setInputStyleName("input")
    }

    const count = useRef(0);
    function cell_click(e) {
        const element = e.target.parentNode.lastChild;
        let timeOut;
        clearTimeout(timeOut)
        count.current += 1
        element.disabled = false;
        element.focus();
        element.select()
        timeOut = setTimeout(() => {
            if (count.current === 1) {
                setInputStyleName("input")
            } else if (count.current === 2) {
                setInputStyleName("focusInput");
                element.setSelectionRange(element.value.length,element.value.length,"backward")
            }else {
                return
            }
            count.current = 0;
        }, 200);
    }

    return (
        <td
            onMouseEnter={selectCells_another}
            onMouseDown={selectCells_first}
            onMouseUp={
                ()=>{
                    getDragSelectCells(false)
                }
            }
            style={props.cellStyle}
            onContextMenu={forRight}
        >
            {
                inputStyleName !== "focusInput" ? 
                <div style={{
                        position:"absolute",
                        left:0,
                        top:0,
                        width:"100%",
                        height:"100%",
                        backgroundColor:"rgba(255,255,255,0)",
                    }}
                    onClick={cell_click}
                ></div> : 
                null
            }
            <input 
                onFocus={focus_cell}
                onPaste={clipboard}
                className={styles[inputStyleName]}
                type="text" 
                disabled = {true}
                onKeyDown = {keyDown}
                onBlur = {blur_inputBox}
                value={props.value} 
                onChange={changeValue}
                style={props.inputStyle}
            />
        </td>
    )
}