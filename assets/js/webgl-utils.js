class FragShaderPlayer {
    constructor(canvasId){
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('experimental-webgl');

        this.vertCode =`attribute vec3 coord;void main(void){gl_Position=vec4(coord,1.0);}`;
        this.fragCode =`void main(void){gl_FragColor=vec4(vec3(0.5), 1.0);}`

        this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertShader, this.vertCode);
        this.gl.compileShader(this.vertShader);
        this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        this.mousePos = {x: this.canvas.clientWidth/2.0, y:this.canvas.clientHeight/2.0}

        this.ready = false
        this.canvas.addEventListener('mousemove', (evt) => {
            var rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = evt.clientX - rect.left;
            this.mousePos.y = rect.bottom - evt.clientY;
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }, false);

        this.playing = false;
        this.vertices = [-1,1,0, -1,-1,0, 1,-1,0, 1,1,0];
        this.indices = [0,1,2, 0,2,3];
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    setFragShader(pFragCode){
        this.fragCode = pFragCode
        this.gl.shaderSource(this.fragShader, this.fragCode);
        this.gl.compileShader(this.fragShader);

        var message = this.gl.getShaderInfoLog(this.fragShader);
        if (message.length > 0) {
            console.log(message);
            this.ready = false
        }else{
            this.ready = true
            this.makeProgram()
            window.requestAnimationFrame((timeStamp) => { this.loop(timeStamp)});
        }
    }

    bind(){
        this.coordAttrib = this.gl.getAttribLocation(this.shaderProgram, "coord");
        this.gl.enableVertexAttribArray(this.coord);
        this.gl.vertexAttribPointer(this.coord, 3, this.gl.FLOAT, false, 0.5, 0); 
    }

    makeProgram(){
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, this.vertShader);
        this.gl.attachShader(this.shaderProgram, this.fragShader);
        this.gl.linkProgram(this.shaderProgram);
        this.gl.useProgram(this.shaderProgram);
        
        this.bind()
        
        this.time_uniform = this.gl.getUniformLocation(this.shaderProgram, "u_time");
        this.mouse_uniform = this.gl.getUniformLocation(this.shaderProgram, "u_mouse");
        this.resolution_uniform = this.gl.getUniformLocation(this.shaderProgram, "u_resolution");
    }

    loop(timeStamp){
        if (! this.ready) {
            return
        }

        this.bind()
        this.gl.clearColor(0.3, 0.1, 0.4, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        var time = Date.now()
        this.gl.uniform1f(this.time_uniform, timeStamp/1000.0)
        this.gl.uniform1f(this.ratio_uniform, this.canvas.clientWidth/this.canvas.clientHeight)
        this.gl.uniform2f(this.mouse_uniform, this.mousePos.x, this.mousePos.y)
        this.gl.uniform2f(this.resolution_uniform, this.canvas.clientWidth, this.canvas.clientHeight)

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame((timeStamp) => { this.loop(timeStamp)});
    }
}
