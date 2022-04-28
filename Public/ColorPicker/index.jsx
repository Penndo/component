import React from 'react';
import SketchPicker from 'react-color/lib/Sketch';

import styles from './index.module.less';

class ColorPicker extends React.Component {
    state = {
        colorValue:this.props.defaultColor,
        isVisable:"none",
    }

    componentDidUpdate(prevProps){
        if(this.props.defaultColor !== prevProps.defaultColor){
            this.setState({colorValue:this.props.defaultColor})
        }
    }

    changeColor = (color) => {
        this.setState({colorValue: color.hex});
        this.props.getValue(this.props.typeName,this.props.propertyName,color.hex)
    }

    HiddenPopover = (e) => {
        if(e.target !== this.state.corlorPickerTarget){
            this.setState({isVisable:"none"})
            document.removeEventListener("click",this.HiddenPopover)
        }
    }

    //给sketchpicker的包裹层加一个 click 事件，用来阻止事件冒泡。
    //因为给 document 添加点击事件。所以，在点击色板的时候事件也会冒泡的 document 上面去，导致色板被隐藏。因此我们在色板上加一个 stopPropagation 就可以防止 document 上的事件被触发。
    sketchPickerHandle = (e) => {
        e.stopPropagation();
    }
    
    
    showSketchPicker = (e) => {
        //点击颜色按钮时，再次去获取 props 。这时 props 已经更新了，将会拿到最新的 props。因此不是所有情况下 props 改变去驱动子页面的改变都需要使用 componentDitUpdate 或者 useEffect 要看你是要主动去更新，还是被动的接受更新。
        this.setState({
            colorValue:this.props.defaultColor
        })
        if(this.state.isVisable === "none"){
            //点击的时候 创建一个 colorPickerTarget 状态，可以看见原始状态是没有这个的。状态毕竟只是一个对象，可以自由的增删。这在某些不知如果定义初始值的时候非常有用。
            this.setState({isVisable:"block",corlorPickerTarget:e.currentTarget})
            document.addEventListener("click",this.HiddenPopover)
        }else if(this.state.isVisable === "block"){
            this.setState({isVisable:"none"})
            document.removeEventListener("click",this.HiddenPopover)
            // console.log("不是全局隐藏")
        }

    }
    
    render() {
        const {style} = this.props;
        const {isVisable, colorValue} = this.state;
        return (
            <div className={styles["colorPicker"]}>
                {/* 颜色显示的包裹框，如图的边框 */}
                <div 
                    className = {styles['trigger-wrapper']} 
                    style={{
                            ...style
                        }}
                >
                    {/* 颜色显示块 */}
                    <div
                        title={'点击修改颜色'}
                        className={styles['color-picker-trigger']}
                        onClick = {this.showSketchPicker}
                        style={{
                            width:style.width-6,
                            height:style.height-6,
                            backgroundColor: colorValue
                        }}
                    ></div>
                </div>
                <div 
                    onClick = {this.sketchPickerHandle}
                    style = {{display:isVisable, position:"absolute",right:0,top:28,zIndex:1000}}
                >
                    <SketchPicker
                        color={colorValue}
                        onChange={this.changeColor}
                        width={252}
                    />
                </div>

            </div>

        );
    }
}

export default ColorPicker;
