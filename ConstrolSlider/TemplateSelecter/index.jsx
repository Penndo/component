import * as React from "react";
import * as IDB from "../../Public/IDB"
import styles from './index.module.less';
import Options from "../../Public/Options";

const defaultHistoryName = "historyStore";

function onchange() {
    return null;
}

class TemplateSelecter extends React.Component {
    
    state={
        inputValue:this.props.historyStorageData.length ? this.props.historyStorageData[0].history : "",
        selecter:0,
    }

    componentDidUpdate(prevProps){
        if(this.props.historyStorageData !== prevProps.historyStorageData){
            if(this.props.historyStorageData.length){
                this.setState({inputValue:this.props.historyStorageData[0].history})
            }else{
                this.setState({inputValue:""})
            }
            
        }
    }
    
    onfocus = ()=>{
        this.setState({
            selecter:1,
        })
    }

    onblur = ()=>{
        this.setState({
            selecter:0,
        })
    }

    //输入框的值显示
    setInputValue = (value)=>{
        this.setState({
            inputValue:value,
        });
        //还需要拿一个函数进来，用来更新侧边栏状态
        IDB.createIDB().then((db)=>{
            //获取模板数据
            IDB.update(db,defaultHistoryName,{id:1,history:value});
        });
        console.log(this.props)
        this.props.switchTemplate(value);
    }

    render(){
        const {defaultStorageData, updateData} = this.props
        const {selecter,inputValue} = this.state;

        let defaultItem = [];
        for(let i=0;i<defaultStorageData.length;i++){
            defaultItem.push(defaultStorageData[i].title);
        }
        return (
            <div className={styles["selecter"]}>
                <p>{this.props.type}</p>
                <input type="text" onFocus={this.onfocus} onBlur={this.onblur} onChange={onchange} placeholder="暂无模板，请创建" value={inputValue}></input>
                {
                    defaultStorageData.length ? 
                    <div className={styles["preInstall"]} style={{display:selecter ? "block" : "none"}}>
                        <Options close={true} options = {defaultItem} updateData={updateData} selectOption={this.setInputValue}/>
                    </div>
                    : null
                }

            </div>
        )
    }
}

export default TemplateSelecter;



