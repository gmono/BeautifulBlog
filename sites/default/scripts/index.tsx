//接口导入 
import { IContentMeta } from '../../../app/Interface/IContentMeta';

// import * as React from "react"
// import * as ReactDOM from "react-dom"

var React:any;
var ReactDOM:any;

let Item=(props:{
    info:IContentMeta,
    summary:string,
    OnTitleClick:(()=>void),
    OnSummaryClick:(()=>void),
    isExpanded:boolean})=>{

    return (<div onClick={props.OnTitleClick} className="item">
        <div>{props.info.title}</div>
        <div style={{
            color:"blue",
            fontSize:"0.7em"
        }}>{props.info.date}</div>
        <div>{props.summary}<span style={{
            color:"pink",
            fontSize:"0.8em",
            fontWeight:"bold"
        }}>{props.isExpanded? "收起":"展开"}</span></div>
    </div>)
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
        this.setState({
            isExpanded:false,
            isloaded:false
        });
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
            <Item info={this.state.info} summary={this.state.html.slice(0,300)+"......"}
            OnTitleClick={this.enterArticle.bind(this)} 
            OnSummaryClick={this.summarySwitch.bind(this)}
            isExpanded={this.state.isExpanded}
            />)
        }
    }
}

ReactDOM.render(<ArticleItem metapath="/content/about.json" OnEnter={(...args)=>{
    alert(JSON.stringify(args));
}}/>,document.querySelector("div"));
