import React from 'react';
import PropTypes from 'prop-types';
import SketchPicker from 'react-color/lib/Sketch';

import styles from './index.module.less';

class ColorPicker extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.string,
        style: PropTypes.object,
        className: PropTypes.string
    };

    state = {
        colorValue:this.props.defaultColor,
        isVisable:"none",
    }

    changeColor = (color) => {
        this.setState({colorValue: color.hex})
        this.props.getValue(this.props.name, color.hex)
    }

    HiddenPopover = (e) => {
        if(e.target !== this.state.corlorPickerTarget){
            this.setState({isVisable:"none"})
            document.removeEventListener("click",this.HiddenPopover)
        }
    }

    //给sketchpicker的包裹层加一个 click 事件，用来阻止事件冒泡
    sketchPickerHandle = (e) => {
        e.stopPropagation();
        console.log(e.currentTarget,"sketchPicker区域被点击了")
    }
    
    
    showSketchPicker = (e) => {
        // e.stopPropagation();
        //这里不能添加事件冒泡，否则在点击其他的 corlorPicker 时，全局的点击对象会被屏蔽调，导致第一个弹窗不会隐藏。
        if(this.state.isVisable === "none"){
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
        const {isVisable, colorValue} = this.state
        return (
            <div>
                <div 
                    className = {styles['trigger-wrapper']} 
                    style={{
                            ...style,
                        }}
                    >
                    <div
                        title={'点击修改颜色'}
                        className={styles['color-picker-trigger']}
                        onClick = {this.showSketchPicker}
                        style={{
                            width:style.width-6,
                            height:style.height-6,
                            backgroundColor: colorValue
                        }}
                    />
                </div>
                <div 
                    onClick = {this.sketchPickerHandle}
                    style = {{display:isVisable, position:"absolute",right:0,top:28,zIndex:1000}}>
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
