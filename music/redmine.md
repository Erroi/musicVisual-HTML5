AudioContext audio上下文对象
 一般，一个document只有一个AudioContext；
 创建：var ac = new window.AudioContext();
 属性：destination,AudioDestinationNode对象，所有的AudioNode都连接到这里
      currentTime,AudioContext从创建开始到当前时间（s）；
      
 方法：decodeAudioData(arrayBuffer,succ(buffer),err),异步解码包含在arrayBuffer中的音频数据
    createBufferSource(),创建audioBufferSourceNode对象
            var buffersource = ac.createBufferSource();
            属性：buffer:表示要播放的音频资源数据
                 loop:是否循环播放，默认false
                 onended:可绑定音频播放完时 调用的时间处理函数
            方法：start/noteOn(when何时开始,offset从第几秒,duration播放几秒)
                 stop/noteOff(when)
    createAnalyser(),创建AnalyserNode对象
    createGain()/createGainNode(),创建GainNode对象