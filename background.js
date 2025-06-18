
chrome.runtime.onMessage.addListener(handleMessage);
function handleMessage(request, sender, sendResponse) {
	console.log(request,sender)
	let res = null;
	let type = request.type.toUpperCase();
	let Fetch = async function(url = '', data = {}, type = 'GET',sendResponse){
		type = type.toUpperCase(); // 请求方式小写转换成大写
		if (type == 'GET' || type == 'POST') {
			let dataStr = ''; //数据拼接字符串
			Object.keys(data).forEach(key => {
				dataStr += key + '=' + data[key] + '&';
			})
			if (dataStr !== '') {
				dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
				url = url + '?' + dataStr;
			}
		}
		let requestConfig = {
			mode: "same-origin",
			method: type.indexOf('POST')!=-1 ? 'POST' : 'GET' ,
			credentials : 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			mode: "cors", // 用来决定是否允许跨域请求  值有 三个 same-origin，no-cors（默认）以及 cores;
			cache: "no-cache" // 是否缓存请求资源 可选值有 default 、 no-store 、 reload 、 no-cache 、 force-cache 或者 only-if-cached 。
		}
	 
		if (type == 'POST_JSON' || type == 'POST_HTML') {
			Object.defineProperty(requestConfig, 'body', {
				value: JSON.stringify(data)
			})
		}
		if(type == 'POST'){
			requestConfig.headers = {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
		if(type == 'HTML'){
			requestConfig.headers = {
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
				'Content-Type': 'text/html; charset=utf-8'
			}
		}
		try {
			const response = await fetch(url, requestConfig);
			const responseJson = type != 'HTML' && type != 'POST_HTML' ? await response.json() : await response.text();
			sendResponse({state:true,data:responseJson})
			//return responseJson
		} catch (error) {
			//return null;
			sendResponse({state:false,data:error})
		}
	}
	let Ajax = async function(url = '', data = {}, type = 'GET',sendResponse){
		data = type=='POST_JSON' ? JSON.stringify(data) : data;
		let dataType = type.indexOf('HTML')>-1 ? 'html' : 'json';
		let Atype = type.indexOf('POST')>-1 ? 'POST' : 'GET';
		let contentType = type=='POST_JSON' ? 'application/json' : 'application/x-www-form-urlencoded';
		console.log({dataType,Atype,contentType,data})
		$.ajax({
			url:url,
			type:Atype,
			dataType:dataType,
			contentType:contentType,
			data:data,
			success:function(res){
				sendResponse({state:true,data:res})
			},
			error:function(error){
				sendResponse({state:false,data:error})
			}
		})
	}
	switch (type) {
		case 'GETDATA':
			res = Fetch(request.url, request.data, 'GET',sendResponse);
			//res = Ajax(request.url, request.data, 'GET',sendResponse);
			break;
		case 'POSTDATA':
			res = Fetch(request.url, request.data, 'POST',sendResponse);
			//res = Ajax(request.url, request.data, 'POST',sendResponse);
			break;
		case 'POSTJSONDATA':
			res = Fetch(request.url, request.data, 'POST_JSON',sendResponse);
			//res = Ajax(request.url, request.data, 'POST_JSON',sendResponse);
			break;
		case 'POSTJSONHTML':
			res = Fetch(request.url, request.data, 'POST_HTML', sendResponse);
			//res = Ajax(request.url, request.data, 'POST_HTML', sendResponse);
			break;
		case 'GETHTMLDATA':
			res = Fetch(request.url, request.data, 'HTML',sendResponse);
			//res = Ajax(request.url, request.data, 'HTML',sendResponse);
			break;
			//console.log(res)
		default:
			break;
	}
	return true;
}


/**
* 获取本地缓存
* @returns 
*/
async function GetStorage(model) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(model, function (data) {
            console.log(data);
            let Storage = data[model];
            resolve(Storage);
        })
    })
}

/**
* 设置本地缓存
* @returns 
*/
async function SetStorage(model,Data) {
    let Storage = {};
    Storage[model] = Data;
    console.log(Storage)
    return new Promise(function (resolve, reject) {
        chrome.storage.local.set(
            Storage
        , function (data) {
            console.log(data)
            resolve(data)
        })
    })
}

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        console.log('安装成功')
    }
})