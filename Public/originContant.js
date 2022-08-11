import {v4 as uuidv4} from "uuid";

const originControlData = {
    tableWidth:"640",
    tableAmount:{
        cols:"4",
        rows:"4"
    },
    dataFrom:{
        api:"https://randomuser.me/api/?results=5&inc=",
        parameter:"gender,email,nat,phone"
    },
    tbodyPadding:{
        b_top:"12",
        b_right:"16",
        b_bottom:"12",
        b_left:"16"
    },
    theadPadding:{
        h_top:"12",
        h_bottom:"12"
    },
    fill:{
        basicColor:"#FFFFFF",
        switchState:false,
        intervalColor:""
    },
    border:{
        basicColor:"#EDEDED",
        switchState:true,
        intervalColor:"#EDEDED"
    },
    theadFill:{
        basicColor:"#F5F5F5"
    },
    textStyle:{
        basicColor:"#333333",
        fontSize:"14",
        fontWeight:"regular"
    },
    theadTextStyle:{
        basicColor:"#333333",
        fontSize:"14",
        fontWeight:"bold"
    }
}

const originCellSize = {
    height:[40,40,40,40,40],
    width:[160,160,160,160]
}

//初始表头数据及格式
const originHead = function () {
    return(
        [
            {serialNumber:"0",colID:1,title:"A",key:uuidv4()},
            {serialNumber:"1",colID:2,title:"B",key:uuidv4()},
            {serialNumber:"2",colID:3,title:"C",key:uuidv4()},
            {serialNumber:"3",colID:4,title:"D",key:uuidv4()}
        ]
    )
}

//初始表格数据及格式
const originData = function () {
    return(
        [
            {rowID:1,1:"",2:"",3:"",4:"",key:uuidv4()},
            {rowID:2,1:"",2:"",3:"",4:"",key:uuidv4()},
            {rowID:3,1:"",2:"",3:"",4:"",key:uuidv4()},
            {rowID:4,1:"",2:"",3:"",4:"",key:uuidv4()}
        ]
    )
}

const initialCellMarker = {
    offsetLeft:-100,
    offsetTop:-100,
    offsetWidth:0,
    offsetHeight:0
}

export {originControlData, originCellSize, originHead, originData, initialCellMarker};