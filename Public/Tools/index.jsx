import React, { useState } from "react";
import {v4 as uuidv4} from "uuid"

//裁切数据，仅保留表格数量的数据大小，若表格数量比已有数据大，那么就要新增表格数量
function shearData(count,data,id,name,updateStatus){
    if(count <= data.length){
        return data.slice(0,count)
    }else{
        let newly = [];
        let newlyLength = count - data.length;
        for(let i=0,j=1;i<newlyLength;i++,j++){
            let newlyItem = {};
            newlyItem.key = uuidv4();
            newlyItem[name] = id + j;
            newly.push(newlyItem);
        }
        updateStatus(id + newlyLength)
        return data.concat(newly);
    }
}


//同步行&列数据，更新过来的新数据与上一次的数据进行更新交换，数组长度只增加不减少
function sync(preData,newData){
    //删除原来的数据，用空对象占位。
    for(let i=0;i<preData.length;i++){
        preData.splice(i,1,{});
    }
    //在之前删除的位置重新写入 newData 内容。
    for(let i=0;i<newData.length;i++){
        preData.splice(i,1,newData[i]);
    }
}

//增加列后，重新计算列宽度。
function recalculate_CellSize(cellArr,tableWidth){

    //计算数组值的总和
    function arr_sum(arr) {
        return arr.reduce((acc,cur)=>acc + cur,0)
    }

    const sum_NewCellSize = arr_sum(cellArr);//新数组所有值的和。用于比例的计算;
    
    //计算比例
    const cellSizePercentage = [];//用来存放比例值
    for(let i=0;i<cellArr.length;i++){
        cellSizePercentage.push(cellArr[i]/sum_NewCellSize)
    };//通过循环将比例值放入 cellSizePercentage 中
    
    //更新宽度
    const newCellWidth = [];
    for(let i=0;i<cellSizePercentage.length;i++){
        newCellWidth.push(Math.floor(cellSizePercentage[i] * tableWidth))
    }

    //因为数据误差这里需要补全，简单处理，用最后一列的宽度吧
    const sum_checkCellWidth = arr_sum(newCellWidth);
    if(sum_checkCellWidth < tableWidth){
        const change = tableWidth - sum_checkCellWidth;//差值
        const lastItemWidth = newCellWidth[newCellWidth.length-1] + change;//修改最后一项的值
        newCellWidth.splice(newCellWidth.length-1,1,lastItemWidth);//替换最后一项
    }

    let newCellSize = {};
    newCellSize.width = newCellWidth;
    return newCellSize;

}

function useShowModal(e) {
    const [selecter, setSelecter] = useState(false);
    const [eventTarget, setEventTarget] = useState(null);

    e.stopPropagation();
    
    if(!selecter){
        setSelecter(true);
        setEventTarget(e.target);
        document.addEventListener("click",hideModal,false)
    }else{
        setSelecter(false);
        document.removeEventListener("click",hideModal,false)
    }
    

    function hideModal(e){
        console.log(e)
        console.log(e.target !== eventTarget)
        if(e.target !== eventTarget){
            setSelecter(false);
            document.removeEventListener("click",hideModal,false)
        }
    }

    console.log(selecter)
    return selecter
}

function withModal_WrappedComponent(WrappedComponent) {

    return class extends React.Component {

        state = {
            selecter:false,
            eventTarget:this.props.event
        }

        componentDidMount() {
            console.log('之心')
        }

        componentDidUpdate(prevProps){
          
            if(this.props.event !== prevProps.event){
                console.log("执行吧",this.props.event)
                const {selecter, eventTarget} = this.state;
                const {event} = this.props
                const that = this;
                if(!selecter){
                    console.log("false")
                    this.setState({
                        selecter:true,
                        eventTarget:event
                    });
                    document.addEventListener("click",hideModal,false);
                }else{
                    console.log("true")
                    this.setState({
                        selecter:false
                    })
                    document.removeEventListener("click",hideModal,false)
                }
                function hideModal(){
                    if(event !== eventTarget){
                        that.setState({
                            selecter:false
                        })
                        document.removeEventListener("click",hideModal,false)
                    }
                }
            }
        }

        render(){
            // WrappedComponent.onclick = this.onclick
            const selecter = this.state.selecter;
            return (
                <div style={{display:selecter ? "block" : "none",position:"absolute",width:"calc(100% - 48px)",zIndex:1000}} >
                    <WrappedComponent {...this.props}/>
                </div>
            )

            
        }
    }
}




export {shearData,sync,recalculate_CellSize,useShowModal,withModal_WrappedComponent}