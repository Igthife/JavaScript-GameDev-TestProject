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
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.speedModifier = 5;
        }
        draw(context){
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                 0, Math.PI * 2);

            context.save();
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
            context.beginPath();
            context.moveTo(this.collisionX, this.collisionY);
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
            context.stroke();

        }

        update(){
            this.dx = (this.game.mouse.x - this.collisionX);
            this.dy = (this.game.mouse.y - this.collisionY);
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
            this.collisionRadius = 60;
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
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                 0, Math.PI * 2);
            context.save();
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
        }
        reposition(){
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
        }
    }

    class Game{
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 260;
            this.player = new Player(this);
            this.numberOfObstacles = 10;
            this.obstacles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            //event listeners
            window.addEventListener('mousedown', e => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
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
            
            
        }
        render(context){
            this.player.draw(context);
            this.player.update();
            this.obstacles.forEach(obstacle => obstacle.draw(context));
        }

        checkCollision(a,b){
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dx, dy);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];

        }

        init(){
            let attempts = 0;
            while(this.obstacles.length < this.numberOfObstacles && attempts < 500){
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

                const margin = testObstacle.collisionRadius * 2;

                if(testObstacle.spriteX < 0 || testObstacle.spriteX > this.width - testObstacle.width){
                    overlap = true;
                }else if(testObstacle.spriteY < this.topMargin - margin|| testObstacle.collisionY > this.height  - margin){
                    overlap = true;
                }   

                if(!overlap){
                    this.obstacles.push(testObstacle);


                }else{
                    console.log("Failed");
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
    //console.log(game);

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate);
    }
    animate();

});