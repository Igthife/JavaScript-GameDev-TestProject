window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';


    class Player{
        constructor(game){
            this.game = game;
            this.collisionX = this.game.width / 2;
            this.collisionY = this.game.height / 2;
            this.collisionRadius = 40;
            this.speedX = 0;
            this.speedY = 0;
            this.speedModifier = 5;
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 5;
            this.image = document.getElementById('bull');
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, 
                this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            

            if(this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                    0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
            context.beginPath();
            context.moveTo(this.collisionX, this.collisionY);
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
            context.stroke();

        }

        update(){
            this.dx = (this.game.mouse.x - this.collisionX);
            this.dy = (this.game.mouse.y - this.collisionY);

            //sprite animation
            const angle = Math.atan2(this.dy, this.dx);

            if(angle < -1.96){
                this.frameY = 7;
            }else if(angle < -1.17){
                this.frameY = 0;
            }else if(angle < -0.39){
                this.frameY = 1;
            }else if(angle < 0.39){
                this.frameY = 2;
            }else if(angle < 1.17){
                this.frameY = 3;
            }else if(angle < 1.96){
                this.frameY = 4;
            }else if(angle < 2.74){
                this.frameY = 5;
            }else if(angle < -2.74 || angle > 2.74){
                this.frameY = 6;
            }
            
            
            const distance = Math.hypot(this.dx, this.dy);
            if(distance > this.speedModifier){
                this.speedX = this.dx / distance || 0;
                this.speedY = this.dy / distance || 0;
                
            }else{
                this.speedX = 0;
                this.speedY = 0;
            }

            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;

            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;

            //horizontal boundaries
            if(this.collisionX < this.collisionRadius){
                this.collisionX = this.collisionRadius;
            }else if(this.collisionX > this.game.width - this.collisionRadius){
                this.collisionX = this.game.width - this.collisionRadius;
            }
            //vertical boundaries
            if(this.collisionY < this.game.topMargin){
                this.collisionY =  this.game.topMargin;
            }else if(this.collisionY > this.game.height - this.collisionRadius){
                this.collisionY = this.game.height - this.collisionRadius;
            }

            //[(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
            // collisions with obstacles 
            this.game.obstacles.forEach(obstacle => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle);
                if(collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;

                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;

                    /*
                    //mysolution
                    this.collisionX += unit_x * this.speedModifier;
                    this.collisionY += unity_y * this.speedModifier;
                    */
                }
            });
        }

    }

    class Obstacle{
        constructor(game){
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 40;
            this.image = document.getElementById('obstacles')
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 70;

            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                 this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            

            if(this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                     0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }
        update(){

        }
        /*reposition(){
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
        }*/
    }

    class Egg{
        constructor(game){
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.margin + this.game.topMargin + (Math.random() * (this.game.height - this.margin * 2 - this.game.topMargin));
            this.image = document.getElementById('egg');
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;


        }
        draw(context){
            context.drawImage(this.image, this.spriteX, this.spriteY);

            if(this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                        0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }
        update(){
            let collisionObjects =[this.game.player, ...this.game.obstacles, ...this.game.enemies];
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if(collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;

                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;

                    if(this.collisionX < 0 + this.game.player.collisionRadius * 2){
                        this.collisionX = 0 + this.game.player.collisionRadius * 2;
                    }else if(this.collisionX > this.game.width - this.game.player.collisionRadius * 2){
                        this.collisionX = this.game.width - this.game.player.collisionRadius * 2;
                    }

                    if(this.collisionY > this.game.height - this.game.player.collisionRadius * 2){
                        this.collisionY = this.game.height - this.game.player.collisionRadius * 2;
                    }
                    

                    this.spriteX = this.collisionX - this.width * 0.5;
                    this.spriteY = this.collisionY - this.height * 0.5 - 30;

                }
            });
        }
    }

    class Enemy{
        constructor(game){
            this.game = game;
            this.collisionRadius = 30;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.game.width + this.collisionRadius;
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById('toad');
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;


        }
        draw(context){
            context.drawImage(this.image, this.spriteX, this.spriteY);

            if(this.game.debug){
                console.log(this.collisionRadius);
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                        0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }
        update(){
            this.collisionX -= this.speedX;

            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;

            if(this.spriteX + this.width < 0){
                this.collisionX = this.game.width + this.collisionRadius * 3;
                this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
                this.speedX = Math.random() * 3 + 0.5;
            }
            
            let collisionObjects =[this.game.player, ...this.game.obstacles];
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if(collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;

                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;

                    this.spriteX = this.collisionX - this.width * 0.5;
                    this.spriteY = this.collisionY - this.height * 0.5 - 100;

                }
            });
            
        }
    }

    class Game{
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 280;
            this.debug = false;
            this.player = new Player(this);
            this.fps = 70;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.maxEggs = 5;
            this.numberOfObstacles = 10;
            this.numberOfEnemies = 3;
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.gameObjects = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            //event listeners
            window.addEventListener('mousedown', e => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                /*
                //mys solution
                if(e.offsetX < 0){
                    this.mouse.x = 0;
                }else if(e.offsetX > this.width){
                    this.mouse.x = this.width;
                }else{
                    this.mouse.x = e.offsetX;
                }
                if(e.offsetY < this.topMargin){
                    this.mouse.y = this.topMargin;
                }else if(e.offsetY> this.height){
                    this.mouse.y = this.height;
                }else{
                    this.mouse.y = e.offsetY;
                }*/
                this.mouse.pressed = true;
            });

            window.addEventListener('mouseup', e => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;

                this.mouse.pressed = false;
            });

            window.addEventListener('mousemove', e => {
                if(this.mouse.pressed){
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;

                }
            });

            window.addEventListener('keydown', e =>{
                if(e.key == 'd'){
                    this.debug = !this.debug;
                }
            })
            
            
        }
        render(context, deltaTime){
            if(this.timer > this.interval){
                context.clearRect(0, 0, this.width, this.height);

                this.gameObjects = [...this.eggs, ...this.obstacles, this.player, ...this.enemies];

                this.gameObjects.sort((a,b) => {
                    return a.collisionY - b.collisionY;
                })

                this.gameObjects.forEach(object =>{
                    object.draw(context);
                    object.update();
                });

                this.timer = 0;

                if(this.debug){
                    context.beginPath();
                    context.rect(0,0,this.width, this.topMargin - this.player.collisionRadius);
                    context.save();
                    context.globalAlpha = 0.5;
                    context.fill();
                    context.restore();
                    context.stroke();
                }
            }
            
            this.timer += deltaTime;

            if(this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs){
                this.addEgg();
                this.eggTimer = 0;
            }else{
                this.eggTimer += deltaTime;
            }
            
            
        }
        addEgg(){
            this.eggs.push(new Egg(this));
        }
        addEnemy(){
            this.enemies.push(new Enemy(this));
        }

        checkCollision(a,b){
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dx, dy);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];

        }

        init(){
            for(let i = 0; i < this.numberOfEnemies; i++){
                this.addEnemy();
            }

            let attempts = 0;
            while(this.obstacles.length < this.numberOfObstacles && attempts < 5000){
                attempts++;
                let testObstacle = new Obstacle(this);
                let overlap = false;
                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distance = Math.hypot(dx, dy);
                    const distanceBuffer = 100;
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius 
                        + distanceBuffer;
                    if(distance < sumOfRadii){
                        overlap = true;
                    }
                });

                const margin = this.player.collisionRadius * 3;

                if(testObstacle.spriteX < 0 || testObstacle.spriteX > this.width - testObstacle.width){
                    overlap = true;
                }else if(testObstacle.spriteY < this.topMargin - margin|| testObstacle.collisionY > this.height  - margin){
                    overlap = true;
                }   

                if(!overlap){
                    this.obstacles.push(testObstacle);
                }

                attempts++;
            }

            /*
            //Tried solving this problem before watching the video and I think it works
            for(let i = 0; i < this.numberOfObstacles; i++){
                this.obstacles.push(new Obstacle(this));
                
                //added code to prevent obstacles from colliding with each other
                for(let x = 0; x < this.obstacles.length-1; x++){
                    var dx2 = (this.obstacles[this.obstacles.length-1].collisionX - this.obstacles[x].collisionX);
                    var dy2 = (this.obstacles[this.obstacles.length-1].collisionY - this.obstacles[x].collisionY);
                    var distance = Math.hypot(dx2, dy2);
                    while(distance < this.obstacles[0].collisionRadius * 2){
                        this.obstacles[this.obstacles.length-1].reposition();
                        dx2 = (this.obstacles[this.obstacles.length-1].collisionX - this.obstacles[x].collisionX);
                        dy2 = (this.obstacles[this.obstacles.length-1].collisionY - this.obstacles[x].collisionY);
                        distance = Math.hypot(dx2, dy2);
                        x = 0
                    }
                }
            }*/
        }
    }

    const game = new Game(canvas);
    game.init();

    let mySound = new Audio('Sounds/Assault_And_Battery_192bpm_120s.wav');
    mySound.muted = true;
    mySound.volume = 0.4;

    mySound.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    })
    
    let lastTime = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
    }
    //animate();

    document.getElementById('Start').addEventListener("click", function() {
        animate(0);
        document.getElementById('container1').hidden = true;
        mySound.muted = false;
        //mySound.play();   //TODO

        game.mouse.x = game.width/2;
        game.mouse.y = game.height/2;
    });


});