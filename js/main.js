var imagesObj= {	
	imagesUrl:[],
	imagesElement:{}/*不用数组,改用键值对*/
};

(function(){
	
	for(var i=1;i<80;i++){
		imagesObj.imagesUrl.push("daomuImg/"+i+".jpg");
	}
	imagesObj.imagesUrl.push("daomuImg/home.png");
	imagesObj.imagesUrl.push("daomuImg/index.jpg");
})()


function preLoadImage(callback){
	
	var iNow = 0;
	for(var i=0; i<imagesObj.imagesUrl.length;i++){
		
		(function(index){
			var img = new Image();
		
			img.src= imagesObj.imagesUrl[index];
			img.onload= function(){
				iNow++;
		
				$("#imgageLoadPercentage").html(Math.round(iNow*100/imagesObj.imagesUrl.length)+"%");
	//			imagesObj.imagesElement.push(this); //加载速度不一样的，数组会错乱，改用键值对{}
				imagesObj.imagesElement[imagesObj.imagesUrl[index]] = this;
				if(iNow ==imagesObj.imagesUrl.length){
					callback();
				}
			}
		})(i) //匿名自执行函数 ，需要将i 值 传进去，接受形式参数
	}
}
//preLoadImage();//调用显示进度条
//以上代码完成进度条的功能

var daomuCanvasElement = $("#daomuCanvas");
var daomuCanvasObj = $("#daomuCanvas").get(0).getContext("2d");
daomuCanvasElement.attr("width",$(document).width());
daomuCanvasElement.attr("height",$(document).height());


var faceCanvasElement = $("#faceCanvas");
var faceCanvasObj = $("#faceCanvas").get(0).getContext("2d");
faceCanvasElement.attr("width",$(document).width());
faceCanvasElement.attr("height",$(document).height());

var daomuCanvasWidth = $(document).width();
var daomuCanvasHeight = $(document).height();

var isTitleShow = false;

preLoadImage(function(){
	//所有图片资源加载完毕;
	setTimeout(function(){
		$("#loading").hide();
	},500);
	
	daomuCanvasObj.drawImage(imagesObj.imagesElement[imagesObj.imagesUrl[80]],0,0,daomuCanvasWidth,daomuCanvasHeight);
	faceCanvasObj.drawImage(imagesObj.imagesElement[imagesObj.imagesUrl[0]],0,0,daomuCanvasWidth,daomuCanvasHeight);


	bindSwipeEvent();
});

//绑定划线事件
function bindSwipeEvent(){
	
	//手机的触摸事件，touchstart touchmove touchend
	daomuCanvasObj.strokeStyle ="red";
	daomuCanvasObj.lineWidth="50";
	daomuCanvasObj.lineCap="round";
	//像素的覆盖合成属性
	//与一开始划的 重叠 就透明， 不重叠就保留
	daomuCanvasObj.globalCompositeOperation = "destination-out";
	daomuCanvasElement.on("touchstart",function(ev){
		//pagex 与 pagey 在下面的对象属性下
		ev = ev.originalEvent.changedTouches[0];
		daomuCanvasObj.beginPath();
		daomuCanvasObj.moveTo(ev.pageX,ev.pageY);
		daomuCanvasElement.on("touchmove",function(ev){
			ev.preventDefault();//阻止默认事件
			ev = ev.originalEvent.changedTouches[0];
			daomuCanvasObj.lineTo(ev.pageX,ev.pageY);
			daomuCanvasObj.stroke();
		})
		
		daomuCanvasElement.on("touchend",function(){
			//jQuery 解绑事件的方法通过off函数
		
			daomuCanvasElement.off("touchmove");
			daomuCanvasElement.off("touchend");
			checkOpacityPercentage();
		})
	})
}
//检查用户擦除的区域所占总区域的比例，
function checkOpacityPercentage(){
	var allImagePixels = daomuCanvasObj.getImageData(0,0,daomuCanvasWidth,daomuCanvasHeight).data;
	
//	console.log(allImagePixels);
	var opacityArr= [];
	for(var i=0;i<allImagePixels.length;i+=4){
		if(allImagePixels[i+3]==0){
			//找到擦除的点(透明度为0的像素点)
			opacityArr.push(i);
		}
	}
	
	if(opacityArr.length >= daomuCanvasHeight*daomuCanvasWidth/2){
		
		daomuCanvasElement.animate({opacity:0},1000,function(){
			$(this).remove();	
			
			//loop face
			loopface();
			//play audio
			playaudio();
		})
	}
}

function loopface(){
	var iNow =0;
	
	setInterval(function(){
		faceCanvasObj.clearRect(0,0,daomuCanvasWidth,daomuCanvasHeight);
		iNow++;
		faceCanvasObj.drawImage(imagesObj.imagesElement[imagesObj.imagesUrl[iNow]],0,0,daomuCanvasWidth,daomuCanvasHeight);
		if(isTitleShow){
			//画go  home 图片
			
			//(daomuCanvasWidth-445)/2 为了让回家的图片 居中显示
			
			faceCanvasObj.drawImage(imagesObj.imagesElement[imagesObj.imagesUrl[79]],(daomuCanvasWidth-445)/2,100);

		}
		if(iNow ==70){
			iNow =15;
		}
	},30);
}


function playaudio(){
	//js 播放音频
	$("#faceAudio").get(0).play();
	
	//监听音频播放完成，ended 事件
	$("#faceAudio").on("ended",function(){
		$("#homeAudio").get(0).play();
		//画一张图片 到facecanvasObj
		isTitleShow= true;
	})
}

/*
 * 1. 定高布局
 * 
 * 2. 匿名自执行函数
 * 
 * 3. 图片预加载
 * 
 * 4. 回调函数
 * 
 * 5. 手机的触摸事件（touchstart ,touchmove ,touchend）
 * 
 * 6. audio(play(), ended 事件监听)

* *7. canvas 像素覆盖合成（刮刮卡效果）
 * */