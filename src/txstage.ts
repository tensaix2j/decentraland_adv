


import resources from "src/resources";
import {Utils} from "src/utils"
import { getUserAccount, RPCSendableMessage  } from '@decentraland/EthereumController'
import { Txsound } from "src/txsound";
import { Perlin } from "src/perlin";

import { NPC }    from '../node_modules/@dcl/npc-utils/index'
import { Dialog } from '../node_modules/@dcl/npc-utils/utils/types'

export class Txstage extends Entity {

	public id;
	public userID;
	public camera;


	
	public player;


	public player_pos  		= new Vector3(0,0,0);
	public player_target  	= new Vector3(0,0,0);
	public vircam  			= new Vector3(0,0,0);
	public vircam_tile 		= new Vector3(0,0,0);


	public tilesize = 0.7;
	public tilegap  = 0.000;
	public xtilecnt = 19;
	public ztilecnt = 19;


	public maxtrees = 50;
	public maxsurfacepatches = this.xtilecnt * this.ztilecnt;
	public maxhouses = 10;


	public perlin;

	public map_min = new Vector3(-40, 0, -40);
	public map_max = new Vector3( 40, 0,  40);


	public render_tiles = [];
	public render_trees = [];
	public render_surfacepatches = [];
	public render_surfacepatches_reg = [];
	public render_houses = [];
	public render_npcs = [];




	public tilemaps = {};
	public treemaps = {};
	public surfacepatches = {};
	public housemaps = {};



	public tilemats = [];
	public movablefloor ;
	public conversing = false;


	constructor( id, userID , transform_args , camera ) {

		super();
		engine.addEntity(this);

		this.id = id;
		this.userID = userID;
		this.camera = camera;

		this.addComponent( new Transform( transform_args )  );

		let i,j;
		let size = this.tilesize;
		let gap  = this.tilegap;



		let tilemat = new Material();
		tilemat.albedoColor = Color3.FromInts( 230, 255, 255);
		this.tilemats.push( tilemat );

		let tilemat2 = new Material();
		tilemat2.albedoColor = Color3.FromInts(76,52,26);
		this.tilemats.push( tilemat2 );
		

		let tilemat3 = new Material();
		tilemat3.albedoTexture = resources.textures.floor;
		tilemat3.specularIntensity = 0;
		tilemat3.roughness = 1;
		this.tilemats.push( tilemat3 );
		

		let tilemat4 = new Material();
		tilemat4.albedoColor = Color3.FromInts(76,52,26);
		tilemat4.specularIntensity = 0;
		tilemat4.roughness = 1;
		this.tilemats.push( tilemat4 );

		let tilemat5 = new Material();
		tilemat5.albedoTexture = resources.textures.surfacepatch;
		tilemat5.bumpTexture = resources.textures.surfacepatch;

		tilemat5.specularIntensity = 0;
		tilemat5.roughness = 1;
		this.tilemats.push( tilemat5 );

			

		this.create_borders();
		this.create_floors();
		this.create_renderable();
		this.create_npcs();

		

		let player = new Entity();
		player.setParent( this );
		player.addComponent( new BoxShape() );
		player.getComponent( BoxShape ).withCollisions = false;


		player.addComponent( new Transform( {
			position: new Vector3(0,   0.5, 0),
			scale:    new Vector3(0.2, 0.3, 0.2)
		}));
		player.addComponent( tilemat2 );
		this.player = player;
		








		const input = Input.instance;
		let _this = this;

        input.subscribe("BUTTON_DOWN", ActionButton.POINTER, true, (e) => {
           	_this.global_input_down(e);
        });
        input.subscribe("BUTTON_UP", ActionButton.POINTER, false, (e) => {
            _this.global_input_up(e);
        });
        input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (e) => {
            _this.global_input_down(e);
        });
        input.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, (e) => {
           _this.global_input_up(e);
        });
        input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
            _this.global_input_down(e);
        });
        input.subscribe("BUTTON_UP", ActionButton.SECONDARY, false, (e) => {
            _this.global_input_up(e);
        });


        this.perlin = new Perlin();
        this.init_maps();

        this.render_map();

	}

	//------
	update(dt ) {
		
		let diffx = this.player_target.x - this.player_pos.x;
		let diffz = this.player_target.z - this.player_pos.z;
		let speed = 1.2;
		let halftilesize = this.tilesize / 2;
		
		if ( diffx * diffx + diffz * diffz >= 0.15 * 0.15 ) {

			let rad	 = Math.atan2( diffx, diffz );
	    	let deg  = rad * 180.0 / Math.PI ;
	    	let delta_x = speed * dt * Math.sin(rad);
	    	let delta_z = speed * dt * Math.cos(rad);

	    	this.player_pos.x += delta_x;
	    	this.player_pos.z += delta_z;
	    }

	    this.vircam.x = this.player_pos.x ;
		this.vircam.z = this.player_pos.z ;
		
		this.render_map();
		
	    

	}

	//-----------
	render_map() {
		
		
		let i;
		let j;
		
		let halftilesize = this.tilesize / 2;
		let half_xtilecnt = (this.xtilecnt / 2 ) >> 0;
		let half_ztilecnt = (this.ztilecnt / 2 ) >> 0;
		

		// Player
		this.player.getComponent(Transform).position.y = 0.5 ; 
		this.player.getComponent(Transform).position.x = this.player_pos.x - this.vircam.x; 
		this.player.getComponent(Transform).position.z = this.player_pos.z - this.vircam.z; 
		
		//Floor 
		this.movablefloor.getComponent( Transform ).position.x = -this.vircam.x % this.tilesize;
		this.movablefloor.getComponent( Transform ).position.z = -this.vircam.z % this.tilesize;





		
		if ( this.vircam.x >= 0 ) {
			this.vircam_tile.x = ( (this.vircam.x + halftilesize) / this.tilesize ) >> 0;
		} else {
			this.vircam_tile.x = ( (this.vircam.x - halftilesize) / this.tilesize ) >> 0;
		}

		if ( this.vircam.z >= 0 ) {
			this.vircam_tile.z = ( (this.vircam.z + halftilesize) / this.tilesize ) >> 0;
		} else {
			this.vircam_tile.z = ( (this.vircam.z - halftilesize) / this.tilesize ) >> 0;
		}

		
		
		for ( i = 0 ; i < this.render_trees.length; i++ ) {
			this.render_trees[ i ].getComponent(Transform).position.y = -999; 
		}

		for ( i = 0 ; i < this.render_houses.length; i++ ) {
			this.render_houses[ i ].getComponent(Transform).position.y = -999;
		}

		for ( i = 0 ; i < this.render_npcs.length ; i++ ) {
			let npc_tilex =  this.render_npcs[i]["virtualPosition"].x ;
			let npc_tilez =  this.render_npcs[i]["virtualPosition"].z ;
			if ( 
						(npc_tilex >= this.vircam_tile.x - half_xtilecnt)  && 
					 	(npc_tilex <= this.vircam_tile.x + half_xtilecnt)  &&
					 	(npc_tilez >= this.vircam_tile.z - half_ztilecnt)  && 
					 	(npc_tilez <= this.vircam_tile.z + half_ztilecnt) 
			) { 


				this.render_npcs[i].getComponent(Transform).position.x = npc_tilex * this.tilesize - this.vircam.x;
				this.render_npcs[i].getComponent(Transform).position.z = npc_tilez * this.tilesize - this.vircam.z;
				this.render_npcs[i].getComponent(Transform).position.y = 0.5;
				
			} else {
				this.render_npcs[i].getComponent(Transform).position.y = -999;
			}

		}

		for ( i = 0 ; i < this.render_surfacepatches.length; i++ ) {
			
			if ( typeof this.render_surfacepatches_reg[i] != undefined && this.render_surfacepatches_reg[i] != null ) {
				
				let tilex = this.render_surfacepatches_reg[i].x;
				let tilez = this.render_surfacepatches_reg[i].z;

				if ( 
						(tilex < this.vircam_tile.x - half_xtilecnt)  || 
					 	(tilex > this.vircam_tile.x + half_xtilecnt)  ||
					 	(tilez < this.vircam_tile.z - half_ztilecnt)  || 
					 	(tilez > this.vircam_tile.z + half_ztilecnt) 
				) { 
					

					this.render_surfacepatches[ i ].getComponent(Transform).position.y = -999; 
				 	this.surfacepatches[ tilex + "," + tilez ] = this.surfacepatches[ tilex + "," + tilez ] & 0x0f; 
					this.render_surfacepatches_reg[i] = null;

					//log( "removed", xtile , ztile );

				}
			}
		}



		

		let tree_i = 0;
		let house_i = 0;


		for ( i = this.vircam_tile.z - half_ztilecnt ; i <= this.vircam_tile.z + half_ztilecnt ; i++ ) {
			for ( j = this.vircam_tile.x - half_xtilecnt ; j <= this.vircam_tile.x + half_xtilecnt ; j++ ) {

				let x = j * this.tilesize - this.vircam.x ;
				let z = i * this.tilesize - this.vircam.z ;

						
				if ( this.surfacepatches[ j + "," + i ] > 0 &&  (this.surfacepatches[ j + "," + i ] >> 4 ) == 0  ) {

					let orisurfacetype = this.surfacepatches[ j + "," + i ] ;
					let surfacepatch_i = this.get_unused_render_surfacepatch_index() ;

					if ( surfacepatch_i > -1 ) {


						let frameindex_x, frameindex_y;
						let framesize_x, framesize_y;

						if ( orisurfacetype == 1 ) {
							
							let frameindex = 0;
							if ( this.surfacepatches[ j + "," + (i+1) ] > 0 ) {
								frameindex |= 1;
							}
							if ( this.surfacepatches[ (j+1) + "," + (i) ] > 0 ) {
								frameindex |= 2;
							}
							if ( this.surfacepatches[ (j) + "," + (i-1) ] > 0 ) {
								frameindex |= 4;
							}
							if ( this.surfacepatches[ (j-1) + "," + (i) ] > 0 ) {
								frameindex |= 8;
							}

							frameindex_x = frameindex % 4;
							frameindex_y = (frameindex / 4 ) >> 0;
							framesize_x  = 0.125;
							framesize_y  = 0.125;
						
						} else if ( orisurfacetype == 2 ) {
							frameindex_x = 0;
							frameindex_y = 2;
							framesize_x  = 0.25;
							framesize_y  = 0.25;

						}

						

						this.render_surfacepatches[ surfacepatch_i ].getComponent( PlaneShape ).uvs = [
							frameindex_x * framesize_x 					, frameindex_y * framesize_y ,
							frameindex_x * framesize_x 					, frameindex_y * framesize_y + framesize_y,
							frameindex_x * framesize_x + framesize_x	, frameindex_y * framesize_y + framesize_y,
							frameindex_x * framesize_x + framesize_x  	, frameindex_y * framesize_y,
							frameindex_x * framesize_x 					, frameindex_y * framesize_y ,
							frameindex_x * framesize_x 					, frameindex_y * framesize_y + framesize_y,
							frameindex_x * framesize_x + framesize_x	, frameindex_y * framesize_y + framesize_y,
							frameindex_x * framesize_x + framesize_x  	, frameindex_y * framesize_y
						]
						


						// Register
						this.render_surfacepatches_reg[ surfacepatch_i ] = new Vector3(j,0,i);
						this.surfacepatches[ j + "," + i ] =   ( surfacepatch_i << 4 ) + orisurfacetype ;



					}
				
				} else if ( this.surfacepatches[ j + "," + i ] >> 4 > 0  ) {

					let surfacepatch_i = this.surfacepatches[ j + "," + i ] >> 4;
					this.render_surfacepatches[ surfacepatch_i ].getComponent(Transform).position.x = x; 
					this.render_surfacepatches[ surfacepatch_i ].getComponent(Transform).position.z = z; 
					this.render_surfacepatches[ surfacepatch_i ].getComponent(Transform).position.y = halftilesize + 0.01 ; 


				}



				if ( this.treemaps[ j + "," + i ] == 1 && tree_i < this.maxtrees ) {

					this.render_trees[ tree_i ].getComponent(Transform).position.x = x; 
					this.render_trees[ tree_i ].getComponent(Transform).position.z = z; 
					this.render_trees[ tree_i ].getComponent(Transform).position.y = halftilesize ; 
					tree_i += 1;
				}

				if ( this.housemaps[ j + "," + i ] == 1 && house_i < this.maxhouses ) { 
					this.render_houses[ house_i ].getComponent(Transform).position.x = x; 
					this.render_houses[ house_i ].getComponent(Transform).position.z = z; 
					this.render_houses[ house_i ].getComponent(Transform).position.y = halftilesize ; 
					house_i += 1;	
				}
				
			}
		}
		




	}





	//----
	global_input_up(e) {
		
    }
    //----
	global_input_down(e) {
		
		if ( e.buttonId == 0 ) {
			if ( e.hit ) {

				let hitEntity = engine.entities[e.hit.entityId];
				if ( typeof hitEntity != "undefined"   ) {
					
					if ( this.conversing ) {
						return ;
					}
	
					let transform = this.getComponent(Transform);

					
					//log( e.hit.hitPoint.x - transform.position.x , e.hit.hitPoint.z - transform.position.z );
					this.player_target.x = e.hit.hitPoint.x - transform.position.x + this.vircam.x ;
					this.player_target.z = e.hit.hitPoint.z - transform.position.z + this.vircam.z ;

					if ( this.player_target.x < this.map_min.x * this.tilesize  ) {
						this.player_target.x = this.map_min.x * this.tilesize;
					}
					if ( this.player_target.x > this.map_max.x * this.tilesize) {	
						this.player_target.x = this.map_max.x * this.tilesize;
					}
					if ( this.player_target.z < this.map_min.z * this.tilesize) {
						this.player_target.z = this.map_min.z * this.tilesize;
					}
					if ( this.player_target.z > this.map_max.z * this.tilesize) {	
						this.player_target.z = this.map_max.z * this.tilesize;
					}	

					//log( this.player_target.x , this.player_target.z );

				} 
			}
		} else if ( e.buttonId == 1 ) {
			log( this.vircam_tile.x , this.vircam_tile.z , this.player_pos.x , this.player_pos.z  );
		}
    }







    //---
    get_unused_render_surfacepatch_index( ) {
    	let i;
    	for ( i	= 0 ; i < this.render_surfacepatches.length ; i++ ) {
    		if ( typeof this.render_surfacepatches_reg[i] == "undefined" || this.render_surfacepatches_reg[i] == null ) {
    			return i;
    		}
    	}
    	return -1;
    }	




    //---
    create_floors() {

		let floor = new Entity();
		floor.setParent(this);
		floor.addComponent( new BoxShape() );
		floor.addComponent( new Transform({
			position: new Vector3(0,0,0),
			scale   : new Vector3( this.tilesize * this.xtilecnt , this.tilesize -0.01,   this.tilesize * this.ztilecnt )
		}));
		floor.addComponent( this.tilemats[1] );
		
		let movablefloor = new Entity();
		movablefloor.setParent( this );
		movablefloor.addComponent( new PlaneShape() );
		movablefloor.getComponent( PlaneShape ).withCollisions = false;

		movablefloor.addComponent( new Transform( {
			position: new Vector3(0, this.tilesize / 2 , 0),
			scale   : new Vector3( this.tilesize * this.xtilecnt , this.tilesize * this.ztilecnt , 1 )
		}));
		movablefloor.getComponent(Transform).rotation.eulerAngles = new Vector3(90,0,0);

		movablefloor.addComponent( this.tilemats[2] );
			
		this.movablefloor = movablefloor;
    }

















    //-----
    create_borders() {
    	
    	let half_ztilecnt = ( this.ztilecnt / 2 ) >> 0;	
		let half_xtilecnt = ( this.xtilecnt / 2 ) >> 0;
		let y = 0;
		let borderbox = new Entity();
		borderbox.setParent( this );
		borderbox.addComponent( new BoxShape() );
		borderbox.addComponent( new Transform({
			position: new Vector3(0,  y , half_ztilecnt * this.tilesize ),
			scale: new Vector3( this.tilesize * (this.xtilecnt + 1) , this.tilesize * 3.2 , this.tilesize * 2 )
		}));
		borderbox.addComponent( this.tilemats[1] );


		borderbox = new Entity();
		borderbox.setParent( this );
		borderbox.addComponent( new BoxShape() );
		borderbox.addComponent( new Transform({
			position: new Vector3(0, y, -half_ztilecnt * this.tilesize ),
			scale: new Vector3( this.tilesize * (this.xtilecnt+1) , this.tilesize * 3.2 , this.tilesize * 2 )
		}));
		borderbox.addComponent( this.tilemats[1] );

		borderbox = new Entity();
		borderbox.setParent( this );
		borderbox.addComponent( new BoxShape() );
		borderbox.addComponent( new Transform({
			position: new Vector3( -half_xtilecnt * this.tilesize ,y, 0 ),
			scale: new Vector3( this.tilesize * 2  , this.tilesize * 3.2 , this.tilesize * this.ztilecnt)
		}));
		borderbox.addComponent( this.tilemats[1] );

		borderbox = new Entity();
		borderbox.setParent( this );
		borderbox.addComponent( new BoxShape() );
		borderbox.addComponent( new Transform({
			position: new Vector3( half_xtilecnt * this.tilesize ,y, 0 ),
			scale: new Vector3( this.tilesize * 2  , this.tilesize * 3.2 , this.tilesize * this.ztilecnt)
		}));
		borderbox.addComponent( this.tilemats[1] );
		
    }





    create_renderable() {

    	let i;
    	for ( i = 0 ; i < this.maxtrees ; i++ ) {

			let tree = new Entity();
			tree.setParent(this);
			tree.addComponent( new Transform({
				position: new Vector3(0,-999,0),
				scale   : new Vector3(1,1,1)
			}) );
			tree.addComponent( resources.models.tree );
			this.render_trees.push( tree );
		}

		for ( i = 0 ; i < this.maxsurfacepatches; i++ ) {

			let surfacepatch = new Entity();
			surfacepatch.setParent( this );
			surfacepatch.addComponent( new Transform( {
				position: new Vector3(0, -999 ,0),
				scale   : new Vector3( this.tilesize , this.tilesize ,1)
			}));

			surfacepatch.getComponent(Transform).rotation.eulerAngles = new Vector3(90,0,-90);
			surfacepatch.addComponent( new PlaneShape() );
			surfacepatch.getComponent( PlaneShape ).withCollisions = false;
			
			surfacepatch.addComponent( this.tilemats[4] );
			this.render_surfacepatches.push( surfacepatch );
		}

		for ( i = 0 ; i < this.maxhouses; i++ ) {
			let house = new Entity();
			house.setParent( this );
			house.addComponent( new Transform({
				position: new Vector3(0,-999,0),
				scale   : new Vector3(this.tilesize, this.tilesize , this.tilesize )
			}) );
			house.addComponent( resources.models.house );
			this.render_houses.push( house );
		}

    }

    create_npcs() {

    	let _this = this;

    	let ILoveCats: Dialog[] = [
    		{
    			text: 'Greeting Traveller'
    		},
    		{
    			text: 'This is a mini-world within the virtual world'
    		},
    		{
    			text: 'Everything fits inside a single parcel.'
    		},
    		{
    			text: 'To the south is where the town is located, to the north is the entrance to the Dungeon.'
    		},
			{
				text: 'Have a nice day.',
				isEndOfDialog: true,
				triggeredByNext: () => {
			    	_this.conversing = false;
			    }
			},
		]

		let myNPC = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/knight.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    			
		    	myNPC.talk(ILoveCats, 0);
		    },
		    {
				idleAnim: `Weight_Shift`,
				portrait: { path: 'models/knight_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -180, 0 );
		myNPC.setParent(this);
		myNPC["virtualPosition"] = new Vector3(0,0,1);

		this.render_npcs.push( myNPC );

    }





	//---------
	// BOOKMARK
	init_maps() {

		
		let i, j, rnd ;
		let half_xtilecnt = (this.xtilecnt / 2 ) >> 0;
		let half_ztilecnt = (this.ztilecnt / 2 ) >> 0;

		this.init_roadmaps();


		for ( i = this.map_min.z  ; i <= this.map_max.z  ; i++ ) {
			for ( j = this.map_min.x  ; j <= this.map_max.x  ; j++ ) {

				if ( this.surfacepatches[ j + "," + i ] != 2 ) {
					
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.2 ) {
						this.treemaps[ j + "," + i ] = 1;
					}

					
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.4 ) {
						this.surfacepatches[ j + "," + i ] = 1;
					}
					

				}
			}
		}
		
		this.housemaps["-3,-10"] = 1;
		this.housemaps["-3,-13"] = 1;
		this.housemaps["3,-10"] = 1;
		this.housemaps["3,-13"] = 1;
			
				
			
	}

	//-----
	init_roadmaps() {

		let i,j;

		for ( i = -13 ; i < 10 ; i++ ) {
			this.surfacepatches[ 0 + "," + i ] = 2;
		}
		for ( j = -2 ; j <= 2 ; j++ ) {
			this.surfacepatches[ j + "," + -10 ] = 2;
		}
		for ( j = -2 ; j <= 2 ; j++ ) {
			this.surfacepatches[ j + "," + -13 ] = 2;
		}

		for ( j = 0 ; j <= 20 ; j++ ) {
			this.surfacepatches[ j + "," + 10 ] = 2;
		} 
		for ( i = 10 ; i < 30 ; i++ ) {
			this.surfacepatches[ 20 + "," + i ] = 2;
		}
	}
}
