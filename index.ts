require("readline").emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)


type Cell = {
    x: number,
    y: number,
    id: string,
}

type SnakeCell = Cell & {
    type: 'snake',
    stuffed: boolean
}

type FoodCell = Cell & {
    type: 'food'
}

type Game = {
    metadata: {
        collision: boolean,
        rows: number,
        cols: number,
    },
    snake: SnakeCell[],
    food?: FoodCell,
    direction: Direction
}

enum Direction {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right',
}

let game = createGame()
listen()
tick()

function render(): void {
    for (let i = 0; i < game.metadata.rows; i++) {
        const row: string[] = []

        for (let j = 0; j < game.metadata.cols; j++) {
            const cellId = generateId(i, j)

            const snakeCell = game.snake.find(cell => cell.id === cellId)

            if (snakeCell) {
                if (snakeCell.stuffed) {
                    row.push('#')
                } else {
                    row.push('=')
                }
            } else if (cellId === game.food?.id) {
                row.push('@')
            } else {
                row.push('.')
            }
        }

        console.log(row.join(' '))
    }

    console.log('\n \n')
}

function tick(): void {
    if (game.metadata.collision) {
        game = createGame()
    }

    move()

    render()

    setTimeout(tick, 200)
}

function listen(): void {
    process.stdin.on('keypress', (char, evt) => {
        if (char === "w") { game.direction = Direction.up }
        if (char === "a") { game.direction = Direction.left }
        if (char === "s") { game.direction = Direction.down }
        if (char === "d") { game.direction = Direction.right }
        if (char === "q") process.exit();
    })
}

function move() {
    const head = game.snake[0]

    let x = head.x
    let y = head.y

    if (game.direction === Direction.left) {
        y--

        if (y === -1) {
            y = game.metadata.rows-1
        }
    } else if (game.direction === Direction.right) {
        y++

        if (y === game.metadata.rows) {
            y = 0
        }
    } else if (game.direction === Direction.down) {
        x++

        if (x === game.metadata.cols) {
            x = 0
        }
    } else if (game.direction === Direction.up) {
        x--

        if (x === -1) {
            x = game.metadata.cols-1
        }
    }

    const nextCell = createSnakeCell(x, y)

    const collision = game.snake.find(cell => cell.id === nextCell.id)

    if (collision) {
        game.metadata.collision = true
        return
    }

    if (nextCell.id === game.food?.id) {
        nextCell.stuffed = true
        game.food = createFoodCell(random(game.metadata.cols-1), random(game.metadata.rows-1))
    }

    let tail = game.snake
    if (tail[tail.length-1].stuffed) {
        tail[tail.length-1].stuffed = false
    } else {
        tail = tail.slice(0, -1)
    }

    game.snake = [ nextCell, ...tail]
}

function createGame(): Game {
    const game: Game = {
        metadata: {
            rows: 15,
            cols: 15,
            collision: false,
        },
        snake: [
            createSnakeCell(2,6),
            createSnakeCell(2,5),
            createSnakeCell(2,4),
            createSnakeCell(2,3),
            createSnakeCell(2,2),
        ],
        food: createFoodCell(2, 8),
        direction: Direction.right,
    }

    return game
}

function generateId(x: number, y: number): string {
    return x + ':' + y
}

function createSnakeCell(x: number, y: number): SnakeCell {
    return {
        x,
        y,
        id: generateId(x, y),
        type: 'snake',
        stuffed: false,
    }
}

function createFoodCell(x: number, y: number): FoodCell {
    return {
        id: generateId(x, y),
        x,
        y,
        type: 'food'
    }
}

function random(max: number): number {
    return Math.floor(Math.random() * (max + 1))
}