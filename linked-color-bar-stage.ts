const w : number = window.innerWidth, h : number = window.innerHeight, LCB_NODES = 5

class LinkedColorBarStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    animator : Animator = new Animator()

    linkedColorBar : LinkedColorBar = new LinkedColorBar()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedColorBar.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedColorBar.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedColorBar.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedColorBarStage = new LinkedColorBarStage()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0

    prevScale : number = 0

    dir : number = 0

    update(stopcb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            stopcb()
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {

    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
       if (this.animated) {
          this.animated = false
          clearInterval(this.interval)
       }
    }
}

class LCBNode {

    state : State = new State()

    next : LCBNode

    prev : LCBNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < LCB_NODES - 1) {
            this.next = new LCBNode(this.i + 1)
            this.prev.next = this
        }
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr : LCBNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }

    draw(context : CanvasRenderingContext2D) {
        if (this.prev) {
            this.prev.draw(context)
        }
        const gap : number = w /LCB_NODES
        context.fillStyle = 'yellow'
        context.fillRect(0, 0, gap, h)
    }
}

class LinkedColorBar {

    dir : number = 1

    curr : LCBNode = new LCBNode(0)

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}
