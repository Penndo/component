import * as React from "react";
import {createIDB,update} from "../../Public/IDB"
import styles from './index.module.less';
import Options from "../../Public/Options";

const defaultHistoryName = "historyStore";
const defaultSelection = "默认内容"

class TemplateSelecter extends React.Component {

    state={
        //选择框默认值为历史选择数据中的 history
        inputValue:this.props.historyStorageData.length ? this.props.historyStorageData[0].history : "",
        //下拉选项是否开启
        selecter:false,
        eventTarget:""
    }

    //props 更新后 更新 state
    componentDidUpdate(prevProps){

        if(this.props.historyStorageData !== prevProps.historyStorageData){
            
            if(this.props.historyStorageData.length){
                if(this.state.inputValue === defaultSelection){
                    this.setState({inputValue:defaultSelection})
                }else{
                    this.setState({inputValue:this.props.historyStorageData[0].history})
                }
                
            }else{
                this.setState({inputValue:""})
            }
        }
    }

    //显示&隐藏弹窗
    showModal = (e) => {
        e.stopPropagation();
        const {selecter} = this.state;
        if(!selecter){
            this.setState({
                selecter:true,
                eventTarget:e.target
            })
            document.addEventListener("click",this.hideModal,false)
        }else{
            this.setState({
                selecter:false
            })
            document.removeEventListener("click",this.hideModal,false)
        }
    }

    hideModal = (e) => {
        const {eventTarget} = this.state
        if(e.target !== eventTarget){
            this.setState({
                selecter:false
            })
            document.removeEventListener("click",this.hideModal,false)
        }
    }

    //设置输入框的值显示
    setInputValue = (value)=>{
        this.setState({
            inputValue:value,
            selecter:false
        });

        if(value !== defaultSelection){
            createIDB().then((db)=>{
                //更新历史选择数据
                update(db,defaultHistoryName,{id:1,history:value});
            });
            //从模板更新数据，关键字是这个 value
            this.props.switchTemplate(value);
        }

    }

    render(){
        const {defaultStorageData, updateData, backToInitialState, refreshInterval_usedCount} = this.props
        const {selecter,inputValue} = this.state;
        //获取defaultStorageData 中所有的 title 值，也就是选项
        let options = [defaultSelection];
        for(let i=0;i<defaultStorageData.length;i++){
            options.push(defaultStorageData[i].title);
        }
        return (
            <div className={styles["selecter"]}>
                <p>{this.props.type}</p>
                <input type="text" onClick={this.showModal}  placeholder="暂无模板，请创建" value={inputValue} readOnly></input>
                {
                    //如果选项值长度为 0 就不渲染下拉组件，而如果
                    defaultStorageData.length ? 
                    <div className={styles["preInstall"]} style={{display:selecter ? "block" : "none"}}>
                        <Options backToInitialState={backToInitialState} canDelete={true} options ={options} updateData={updateData} defaultSelection = {defaultSelection} selectOption={this.setInputValue} refreshInterval_usedCount = {refreshInterval_usedCount}/>
                    </div>
                    : null
                }
            </div>
        )
    }
}

export default TemplateSelecter;



