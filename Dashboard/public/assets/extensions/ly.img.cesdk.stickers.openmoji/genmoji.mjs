import e from"node-fetch";let s=null;"undefined"!=typeof window&&(e=window.fetch);try{s=require("fs"),e=require("node-fetch")}catch(e){}let t="",o=[];e("https://raw.githubusercontent.com/hfg-gmuend/openmoji/12.4.0/data/openmoji.json").then((function(e){return e.blob()})).then((function(e){t=e,t.text().then((function(e){let t=JSON.parse(e),n={id:"//ly.img.cesdk.stickers.openmoji",version:"0.2.0",schemaVersion:"0.2.0",assets:[]};n.assets.push({}),n.assets[0].type="ly.img.sticker",n.assets[0].categories=[],n.assets[0].categories.push({}),n.assets[0].categories[0].id="category/openmoji",n.assets[0].categories[0].assets=[],n.assets[0].assets=[];let i=[],a=new Set;for(let e=0;e<t.length;e++){let s=t[e];if(!(void 0!==s.skintone_base_hexcode&&s.skintone_base_hexcode.length>0&&s.skintone_base_hexcode!=s.hexcode||0!==i.length&&void 0===i.find((e=>e===s.group)))){let e=s.annotation.replace(/ /g,"_");for(;a.has(e);)e="_"+e;a.add(e),n.assets[0].categories[0].assets.push("//ly.img.cesdk.stickers.openmoji/"+e);let t={};{let o=s.hexcode+".svg";t={id:e,thumbPath:"https://raw.githubusercontent.com/hfg-gmuend/openmoji/12.4.0/color/svg/"+o,imagePath:"https://raw.githubusercontent.com/hfg-gmuend/openmoji/12.4.0/color/svg/"+o,size:{width:72,height:72}}}n.assets[0].assets.push(t),o.push(s.hexcode)}}null!==s?s.writeFile("manifest.json",JSON.stringify(n,null,4),"utf8",(function(e){if(e)return console.log(e)})):console.log(JSON.stringify(n,null,4))}))}));