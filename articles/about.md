---
title: "关于博客"
date: 2020-01-01T17:57:40+08:00
draft: false
---

**头一次用Hugo构建博客，速度确实快**
# 原因
本来是用onenote记录日记的，然后想用它记录技术日志，但不支持代码高亮和markdown，写起来很不方便  
而网上的onenote插件都是只支持桌面版的onenote，而我用的是uwp版本，虽然感觉uwp版本丝般顺滑，很适合画画记笔记，写日记之类，但用于记录复杂内容还是很不够  
后考虑到使用简书记录，但这种内容托管到一个网站说不定什么时候就倒了的感觉还是不太好，因此考虑使用static博客系统来构建托管到github，看了一下使用go语言的hugo似乎不错，hexo以前是感受到了它的慢，不可理解

# 内容
1. 首先主要是用来记录技术博客的
2. 也有可能用来记录一些非技术方面的结论，不过重要内容我是不会公开的（大概）
3. 顺便还可以发布一下自己的开源项目或框架库什么的
4. 写个人网站时更有逼格

# 代码测试
```js
window.location.href="hello world";
let a=async ()=>{
    class test extends hello{
        constructor(){

        }
        member1=1;
        member2="fadfasdf";
        mem=`${this},hello`;
    }
    return await new test();
}

```

```tsx
class Control extends React.Component<{x:string,y:string},{},{}>{
    constructor(public test:string="hello"){

    }
    render(props){
        //这里代码大概是错误的
        return (
            <div>
                <p>文章内容</p><br/>
                <Control name="test">mynameis hello</Control>
            </div>
        )
            
    }
}
```
```csharp
public class Program
{
    static public void main(string[] args){
        Console.WriteLine("hello world");
    }
    static public (string,string) MyFunc(){
        return ("helo","world");
    }
}

```

# 进展
目前看来，server工作良好
