import React, { useState } from "react";
import {v4 as uuidv4} from "uuid"

//裁切数据，仅保留表格数量的数据大小，若表格数量比已有数据大，那么就要新增表格数量
function shearData(count,data){
    if(count <= data.length){
        return data.slice(0,count)
    }else{
        let newly = [];
        let newlyLength = count - data.length;
        for(let i=0;i<newlyLength;i++){
            let newlyItem = {};
            newlyItem.key = uuidv4();
            newly.push(newlyItem);
        }
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




export {shearData,sync,useShowModal,withModal_WrappedComponent}