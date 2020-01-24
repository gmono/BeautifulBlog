//接口导入 
import { IContentMeta } from '../../../app/Interface/IContentMeta';

import * as React from "react"
import * as ReactDOM from "react-dom"
import { IFiles } from '../../../app/Interface/IFiles';

// var React:any;
// var ReactDOM:any;

interface ItemInfo{
    info:IContentMeta;
    summary:string;
    OnTitleClick:(()=>void);
    OnSummaryClick:(()=>void);
    isExpanded:boolean
}
class Item extends React.Component<ItemInfo,{
    contentHeight:number
}>
{
    constructor(props:ItemInfo){
        super(props);
        this.state={
            contentHeight:0
        };
    }
    componentDidMount(){
        console.log((ReactDOM.findDOMNode(this.refs.content) as HTMLElement).clientHeight)
        this.setState({
            contentHeight:(ReactDOM.findDOMNode(this.refs.content) as HTMLElement).clientHeight
        })
    }
    componentDidUpdate(prevprop,prevstate){
        let h=(ReactDOM.findDOMNode(this.refs.content) as HTMLElement).clientHeight;
        if(prevprop.isExpanded!=this.props.isExpanded){
            this.setState({
                contentHeight:h
            })
        }
    }
    render()
    {
        let uexpstyle={
            height:"100px",
            overflow:"hidden",
            transition:"all ease-out 1s"
        };
        let expstyle={
            transition:"all ease-in 1s",
            height:`${this.state.contentHeight}px`};
        return (<div style={{
            whiteSpace:"normal"
        }}  className="item">
            <div onClick={this.props.OnTitleClick}>{this.props.info.title}</div>
            <div style={{
                color:"blue",
                fontSize:"0.7em"
            }}>{this.props.info.date.toString()}</div>
    
            <div style={this.props.isExpanded? expstyle:uexpstyle} onClick={this.props.OnSummaryClick}>
                <div ref="content"  dangerouslySetInnerHTML={{__html:this.props.summary}}></div>
            {/* <span style={{
                color:"pink",
                fontSize:"0.8em",
                fontWeight:"bold"
            }} onClick={props.OnSummaryClick}>{props.isExpanded? "收起":"展开"}</span> */}
            </div>
        </div>)
    }
}


interface ArticleInfo
{
    metapath:string;
    //进入事件 提供元数据 内容 元数据地址 内容地址
    OnEnter:(metainfo:IContentMeta,html:string,metapath:string,contentpath:string)=>void;
}
interface ArticleItemState{
    isExpanded:boolean,
    isloaded:boolean,
    info:IContentMeta,
    html:string
}
class ArticleItem extends React.Component<ArticleInfo,ArticleItemState>{
    constructor(props:ArticleInfo){
        super(props);
        this.state={
            isExpanded:false,
            isloaded:false,
            info:null,
            html:null
        };
    }

    async loadArticle()
    {
        let res=await fetch(this.props.metapath);
        let json=await res.json() as IContentMeta;
        let hpath=this.props.metapath.replace(/.json$/,".html");
        let html=await (await fetch(hpath)).text()
        this.setState({
            info:json,
            html:html,
            isloaded:true
        });
    }
    async componentDidMount(){
        await this.loadArticle();
    }
    async componentDidUpdate(prevProps: Readonly<ArticleInfo>, prevState: Readonly<ArticleItemState>){
        if(prevProps.metapath!=this.props.metapath){
            await this.loadArticle();
        }
    }
    summarySwitch(){
        this.setState({
            isExpanded:!(this.state.isExpanded)
        });
    }
    enterArticle(){
        //进入此篇文章
        //内容地址
        let hpath=this.props.metapath.replace(/.json$/,".html");
        this.props.OnEnter(this.state.info,this.state.html,this.props.metapath,hpath);
    }
    render(){
        if(!(this.state.isloaded)){
            return (<Item info={{
                title:"加载中",
                article_length:0,
                content_length:0,
                date:new Date(),
                article_path:"未知",
                from_dir:[],
                modify_time:new Date()
            }} 
            summary="加载中......" 
            OnTitleClick={()=>{}} 
            OnSummaryClick={this.summarySwitch.bind(this)}
            isExpanded={this.state.isExpanded} />)
        }
        else{
            return (
            <Item info={this.state.info} summary={this.state.html}
            OnTitleClick={this.enterArticle.bind(this)} 
            OnSummaryClick={this.summarySwitch.bind(this)}
            isExpanded={this.state.isExpanded}
            />)
        }
    }
}


interface ArticleListProp{
    //files.json 路径
    filesPath:string;
}
class ArticleList extends React.Component<ArticleListProp,{
    metalist:string[]
}>
{
    constructor(props){
        super(props);
        
        this.state={
            metalist:[]
        }

    }
    async reload()
    {
        let r=await fetch(this.props.filesPath);
        let f=await r.json() as IFiles;
        let s=f.fileList;
        let ss=[]
        for(let k in s){
            ss.push(k)
        }
        this.setState({
            metalist:ss
        });
    }
    componentDidMount(){
        this.reload();
    }
    componentDidUpdate(prevprop,prevstate){
        if(prevprop.filesPath!=this.props.filesPath){
            this.reload();
        }
    }
    render()
    {
        return (
            <XScrollList >
                {this.state.metalist.map((v)=>{
                    return <div key={v} style={{
                        display:"inline-block",
                        width:"80vw",
                        verticalAlign:"top"
                    }}>
                        <ArticleItem   metapath={v} OnEnter={(...args)=>{
                        alert(JSON.stringify(args));
                        }}/>
                    </div>
                })}
            </XScrollList>
        )
    }
}


class XScrollList extends React.Component<{children:any[]}>{
    constructor(props){
        super(props)
    }

    whell(e:WheelEvent){
        console.log(e.target);
        if(e.target instanceof HTMLElement){
            if(e.target == ReactDOM.findDOMNode(this.refs.mouse)){
                e.preventDefault();
                let ele=ReactDOM.findDOMNode(this.refs.top) as HTMLDivElement;
                window.scroll(window.scrollX+e.deltaY,0);
            }
        }
    }
    componentDidMount(){
        let ele=ReactDOM.findDOMNode(this.refs.mouse);
        if(ele instanceof HTMLElement){
            ele.addEventListener("wheel",this.whell.bind(this),{
                capture:true,
                passive:false
            });
        }
    }
    render(){
        return (
            <div ref="top" style={{
                whiteSpace:"nowrap",
                
            }}>
                <div ref="mouse" style={{
                    position:"fixed",
                    right:"0",
                    bottom:"0",
                    height:"200px",
                    width:"200px",
                    backgroundColor:"gray"
                }}></div>
                {this.props.children}
            </div>
        )
    }
}
ReactDOM.render(<ArticleList filesPath="../content/files.json" /> ,document.querySelector("div"));
