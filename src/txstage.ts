



import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2QueryCallback} from "src/Box2D/Dynamics/b2WorldCallbacks";


import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2FixtureDef}  from "src/Box2D/Dynamics/b2Fixture"
import {b2PolygonShape}  from "src/Box2D/Collision/Shapes/b2PolygonShape"
import {b2CircleShape}  from "src/Box2D/Collision/Shapes/b2CircleShape"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2RevoluteJointDef} from "src/Box2D/Dynamics/Joints/b2RevoluteJoint"
import {b2DistanceJointDef} from "src/Box2D/Dynamics/Joints/b2DistanceJoint"
import {b2ContactListener} from "src/Box2D/Dynamics/b2WorldCallbacks"
import {b2AABB}  from "src/Box2D/Collision/b2Collision"



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


	public player_target  	= new Vector3(0,0,0);
	public vircam  			= new Vector3(0,0,0);
	public vircam_tile 		= new Vector3(0,0,0);


	public tilesize = 0.7;
	public tilegap  = 0.000;
	public xtilecnt = 19;
	public ztilecnt = 19;




	public perlin;

	public map_min = new Vector3(-40, 0, -40);
	public map_max = new Vector3( 40, 0,  40);



	// These holds entities to be put in window
	public render_objects 	= [];
	public render_surfaces 	= [];
	public render_npcs 		= [];
	public render_monsters 	= [];


	public objectmaps = {};
	public surfaces = {};
	// Monster map held by b2d 



	public tilemats = [];
	public movablefloor ;
	public conversing = false;

	public shared_billboard  = new Billboard();
	public shared_planeshape = new PlaneShape();

	public world;
	public playerb2d;
	public box2daabb;
	public box2dcallback; 
	public monsters_in_range = [];


	constructor( id, userID , transform_args , camera ) {

		super();
		engine.addEntity(this);

		this.id 		= id;
		this.userID 	= userID;
		this.camera 	= camera;
		

		this.init_box2d();
		this.addComponent( new Transform( transform_args )  );
		this.create_shared_materials();
		this.create_borders();
		this.create_floors();
		this.create_npcs();
		this.create_players();
		this.prepare_inputs();

		
        this.perlin = new Perlin();
        this.init_maps();
        this.render_map();

	}

	//------
	update(dt ) {
		
		this.world.Step( 0.05  , 10, 10 );

		let diffx = this.player_target.x - this.playerb2d.GetPosition().x;
		let diffz = this.player_target.z - this.playerb2d.GetPosition().y;
		let speed = 20;

		let halftilesize = this.tilesize / 2;
		
		if ( diffx * diffx + diffz * diffz >= 0.15 * 0.15 ) {

			let rad	 = Math.atan2( diffx, diffz );
	    	let deg  = rad * 180.0 / Math.PI ;

	    	let delta_x = speed * dt * Math.sin(rad);
	    	let delta_z = speed * dt * Math.cos(rad);

	    	this.playerb2d.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );


	    	this.player.getComponent( Transform ).rotation.eulerAngles = new Vector3( 0, deg , 0 );

	    	this.player.getComponent(Animator).getClip("_idle").playing = false;
	    	this.player.getComponent(Animator).getClip("Walking").playing = true;
	    } else {

	    	this.player.getComponent(Animator).getClip("_idle").playing = true;
	    	this.player.getComponent(Animator).getClip("Walking").playing = false;
	    	this.playerb2d.SetLinearVelocity( new b2Vec2( 0 ,0 ) );

	    }

	    this.vircam.x = this.playerb2d.GetPosition().x;
		this.vircam.z = this.playerb2d.GetPosition().y;
		
		this.render_map();
		
	    

	}

	//-------
	playClip( animator , clipname ) {

		animator.getClip("Punch").playing 		= false;
		animator.getClip("Die").playing 		= false;
		animator.getClip("_idle").playing 		= false;
		animator.getClip("Walking").playing 	= false;
		animator.getClip(clipname).playing 		= true;
	}

    //-------------
    update_monster( monb2d , rendermon_i ) {

    	let diffx = this.playerb2d.GetPosition().x - monb2d.GetPosition().x ;
    	let diffz = this.playerb2d.GetPosition().y - monb2d.GetPosition().y  ;

    	let tilesize_aggro 		= this.tilesize * 6;
    	let tilesize_attack		= this.tilesize * 0.5;
    	
    	let speed = 0.6;
    	let distsqr = diffx * diffx + diffz * diffz;

    	// m,  type ,   reg,   rendermon_i, attacking
    	if ( monb2d.m_userData[4] > 0 ) {

    		monb2d.m_userData[4] -= 1;
    		this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "Punch");

    	} else {

	    	if ( distsqr < tilesize_aggro * tilesize_aggro ) {

		    	if ( distsqr > tilesize_attack * tilesize_attack ) {

		    		var rad	 = Math.atan2( diffx, diffz );
			    	var deg  = rad * 180.0 / Math.PI ;
			    	var delta_x = speed * Math.sin(rad);
			    	var delta_z = speed * Math.cos(rad);

			    	monb2d.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );


			    	this.render_monsters[ rendermon_i ].getComponent( Transform ).rotation.eulerAngles = new Vector3( 0, deg , 0 );
			    	this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "Walking");


			    } else {
			    	
			    	monb2d.SetLinearVelocity( new b2Vec2( 0 , 0 ) );
			    	this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "_idle");
			    	monb2d.m_userData[4] = 20;
			    }
			} 
		}

    }


	//-----
	find_monster_within_window() {

		let search_range_x = this.tilesize * (this.xtilecnt / 2 >> 0) - this.tilesize ;
		let search_range_z = this.tilesize * (this.ztilecnt / 2 >> 0) - this.tilesize ;

		//log( "find_monster_AABB", this.playerb2d.GetPosition().y - search_range_z, this.playerb2d.GetPosition().y + search_range_z  );

		this.box2daabb.lowerBound = new b2Vec2( this.playerb2d.GetPosition().x - search_range_x  , this.playerb2d.GetPosition().y - search_range_z  );
		this.box2daabb.upperBound = new b2Vec2( this.playerb2d.GetPosition().x + search_range_x  , this.playerb2d.GetPosition().y + search_range_z  );
		
		this.monsters_in_range.length = 0;
		this.world.QueryAABB( this.box2dcallback , this.box2daabb);
			
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
		this.player.getComponent(Transform).position.x = this.playerb2d.GetPosition().x - this.vircam.x; 
		this.player.getComponent(Transform).position.z = this.playerb2d.GetPosition().y - this.vircam.z; 
		
		// Floor 
		this.movablefloor.getComponent( Transform ).position.x = -this.vircam.x % this.tilesize;
		this.movablefloor.getComponent( Transform ).position.z = -this.vircam.z % this.tilesize;






		// Get the vircam tilex and tilez
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

		
		
		


		// Render NPC if inside the window
		for ( i = 0 ; i < this.render_npcs.length ; i++ ) {
			let npc_tilex =  ( this.render_npcs[i]["virtualPosition"].x / this.tilesize ) >> 0;
			let npc_tilez =  ( this.render_npcs[i]["virtualPosition"].z / this.tilesize ) >> 0;
			if ( 
						(npc_tilex >= this.vircam_tile.x - half_xtilecnt)  && 
					 	(npc_tilex <= this.vircam_tile.x + half_xtilecnt)  &&
					 	(npc_tilez >= this.vircam_tile.z - half_ztilecnt)  && 
					 	(npc_tilez <= this.vircam_tile.z + half_ztilecnt) 
			) { 


				this.render_npcs[i].getComponent(Transform).position.x = this.render_npcs[i]["virtualPosition"].x - this.vircam.x;
				this.render_npcs[i].getComponent(Transform).position.z = this.render_npcs[i]["virtualPosition"].z - this.vircam.z;
				this.render_npcs[i].getComponent(Transform).position.y = this.render_npcs[i]["virtualPosition"].y;
				
			} else {
				this.render_npcs[i].getComponent(Transform).position.y = -999;
			}

		}

		


		// Monsters
		for ( i = 0 ; i < this.render_monsters.length ; i++ ) {
			
			if ( this.render_monsters[i]["used_by"] != null ) {
				
				let monb2d = this.render_monsters[i]["used_by"];
				let mon_x = monb2d.GetPosition().x ;
				let mon_z = monb2d.GetPosition().y ;

				if ( 
					( mon_x < this.vircam.x - half_xtilecnt * this.tilesize ) ||
					( mon_x > this.vircam.x + half_xtilecnt * this.tilesize ) ||
					( mon_z < this.vircam.z - half_ztilecnt * this.tilesize ) ||
					( mon_z > this.vircam.z + half_ztilecnt * this.tilesize ) 
				) {


					//log("xbound " ,mon_x, this.vircam.x - half_xtilecnt * this.tilesize,this.vircam.x + half_xtilecnt * this.tilesize);
					log("zbound " ,mon_z, this.vircam.z - half_ztilecnt * this.tilesize,this.vircam.z + half_ztilecnt * this.tilesize);
					log("monster removed: id", i  , );

					monb2d.m_userData[2] = 0;
					//this.render_monsters[ i ].getComponent(Transform).position.y = -999; 
					engine.removeEntity( this.render_monsters[ i ] );
				 	this.render_monsters[ i ]["used_by"] = null;
				}
			}   
		}

		
		this.find_monster_within_window();
		for ( i = 0 ; i < this.monsters_in_range.length ; i++ ) {
			
			let monb2d = this.monsters_in_range[i];
			// m, type, reg, rendermon_i 
			if ( monb2d.m_userData[2] == 0 ) {
				
				let rendermon_i = this.get_unused_render_item_index( this.render_monsters ) ;
				if ( rendermon_i == -1 ) {
					rendermon_i = this.create_new_monster_entity();
					
					//log( "new monster created, id:" , rendermon_i );

				} else {
				
					//log( "reusing old monster, id:" , rendermon_i , monb2d.GetPosition().x , monb2d.GetPosition().y );
					engine.addEntity( this.render_monsters[ rendermon_i ] );
					
				}

				if ( rendermon_i > -1 ) {

					this.readjust_monster_model ( monb2d.m_userData , rendermon_i );
							
					this.render_monsters[ rendermon_i ]["used_by"] = monb2d;
					monb2d.m_userData[2] = 1;
					monb2d.m_userData[3] = rendermon_i;
				}	

			} else {

				let rendermon_i = monb2d.m_userData[3];
				
				this.update_monster( monb2d , rendermon_i );
				this.render_monsters[ rendermon_i ].getComponent(Transform).position.x = monb2d.GetPosition().x - this.vircam.x; 
				this.render_monsters[ rendermon_i ].getComponent(Transform).position.z = monb2d.GetPosition().y - this.vircam.z; 
				this.render_monsters[ rendermon_i ].getComponent(Transform).position.y = 0.5 ; 

			} 
			
		}
		






		// Unshow surface which is outside of window
		for ( i = 0 ; i < this.render_surfaces.length; i++ ) {
			
			if ( this.render_surfaces[i]["used_by"] != null ) {
				
				let tilex = this.render_surfaces[i]["used_by"].x;
				let tilez = this.render_surfaces[i]["used_by"].z;

				if ( 
						(tilex < this.vircam_tile.x - half_xtilecnt)  || 
					 	(tilex > this.vircam_tile.x + half_xtilecnt)  ||
					 	(tilez < this.vircam_tile.z - half_ztilecnt)  || 
					 	(tilez > this.vircam_tile.z + half_ztilecnt) 
				) { 
					

					this.surfaces[ tilex + "," + tilez ][1] = 0;
					//this.render_surfaces[ i ].getComponent(Transform).position.y = -999; 
					engine.removeEntity( this.render_surfaces[ i ] );
						
				 	this.render_surfaces[ i ]["used_by"] = null;

				}
			}
		}

		// Unshow object which is outside of window
		for ( i = 0 ; i < this.render_objects.length; i++ ) {
			
			if ( this.render_objects[i]["used_by"] != null ) {
				
				let tilex = this.render_objects[i]["used_by"].x;
				let tilez = this.render_objects[i]["used_by"].z;

				if ( 
						(tilex < this.vircam_tile.x - half_xtilecnt)  || 
					 	(tilex > this.vircam_tile.x + half_xtilecnt)  ||
					 	(tilez < this.vircam_tile.z - half_ztilecnt)  || 
					 	(tilez > this.vircam_tile.z + half_ztilecnt) 
				) { 
					

					this.objectmaps[ tilex + "," + tilez ][1] = 0;
					
					//this.render_objects[ i ].getComponent(Transform).position.y = -999; 
					this.render_objects[ i ]["used_by"] = null;
					engine.removeEntity( this.render_objects[ i ] );

				}
			}
		}
		
		// For all tiles in viewable window
		for ( i = this.vircam_tile.z - half_ztilecnt ; i <= this.vircam_tile.z + half_ztilecnt ; i++ ) {
			for ( j = this.vircam_tile.x - half_xtilecnt ; j <= this.vircam_tile.x + half_xtilecnt ; j++ ) {


				// render surfaces
				if ( this.surfaces[ j + "," + i ] != null ) { 

					let x = j * this.tilesize - this.vircam.x ;
					let z = i * this.tilesize - this.vircam.z ;

					if ( this.surfaces[ j + "," + i ][1] == 0 ) {

						let surface_i = this.get_unused_render_item_index( this.render_surfaces ) ;
						if ( surface_i == -1 ) {
							surface_i = this.create_new_surface_entity();
						} else {
							engine.addEntity( this.render_surfaces[ surface_i ] );
						}

						if ( surface_i > -1 ) {
						
							this.readjust_surface_uv ( j , i , surface_i );

							// Register surface
							this.render_surfaces[ surface_i ]["used_by"] = new Vector3( j , 0 , i );
							this.surfaces[ j + "," + i ][1] = 1 ;
							this.surfaces[ j + "," + i ][2] = surface_i ;
						}
						
					
					} else if ( this.surfaces[ j + "," + i ][1] == 1 ) {

						let surface_i = this.surfaces[ j + "," + i ][2];
						this.render_surfaces[ surface_i ].getComponent(Transform).position.x = x; 
						this.render_surfaces[ surface_i ].getComponent(Transform).position.z = z; 
						this.render_surfaces[ surface_i ].getComponent(Transform).position.y = halftilesize + 0.01 ; 


					}

				}

				// render objects
				if ( this.objectmaps[ j + "," + i ] != null ) { 

					let x = j * this.tilesize - this.vircam.x ;
					let z = i * this.tilesize - this.vircam.z ;

					if ( this.objectmaps[ j + "," + i ][1] == 0 ) {

						let object_i = this.get_unused_render_item_index( this.render_objects ) ;
						if ( object_i == -1 ) {
							object_i = this.create_new_object_entity();
						} else {
							engine.addEntity( this.render_objects[ object_i ] );
						}

						if ( object_i > -1 ) {

							this.readjust_object_model ( j , i , object_i );
							
							// Register object
							this.render_objects[ object_i ]["used_by"] = new Vector3( j , 0 , i );

							this.objectmaps[ j + "," + i ][1] = 1 ;
							this.objectmaps[ j + "," + i ][2] = object_i ;
						}	
					} else if ( this.objectmaps[ j + "," + i ][1] == 1 ) {

						let object_i = this.objectmaps[ j + "," + i ][2];
						this.render_objects[ object_i ].getComponent(Transform).position.x = x; 
						this.render_objects[ object_i ].getComponent(Transform).position.z = z; 
						this.render_objects[ object_i ].getComponent(Transform).position.y = halftilesize + 0.01 ; 
					}
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
			log( this.vircam_tile.x , this.vircam_tile.z , this.playerb2d.GetPosition().x , this.playerb2d.GetPosition().y  );
		}
    }




    //-------------------
    create_new_surface_entity() {

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
		this.render_surfaces.push( surfacepatch );

		return this.render_surfaces.length - 1;

    }	
    
    //----
    create_new_object_entity( ) {

    	let object = new Entity();
		object.setParent(this);
		object.addComponent( new Transform({
			position: new Vector3(0,-999,0),
			scale   : new Vector3(1,1,1)
		}) );
		object.addComponent( resources.models.tree );
		object.getComponent( GLTFShape ).withCollisions = false;
		object["model"] = 1;
		this.render_objects.push( object );

		return this.render_objects.length - 1;
    }


    //----
    create_new_monster_entity() {

    	let monster = new Entity();
		monster.setParent( this );
		monster.addComponent( new Transform({
			position: new Vector3(0, -999,  0),
			scale   : new Vector3( 0.15, 0.15 , 0.15 )
		}));
		monster.addComponent( resources.models.skeleton );
		monster.getComponent( GLTFShape ).withCollisions = false;
		monster["model"] = 2;
		monster.addComponent( new Animator );
		this.addClips( monster.getComponent(Animator ) );
		
		this.render_monsters.push( monster );

		return this.render_monsters.length - 1;

    }


    //---
    get_unused_render_item_index( arr ) {
    	let i;
    	for ( i	= 0 ; i < arr.length ; i++ ) {
    		if ( arr[i]["used_by"] == null ) {
    			return i;
    		}
    	}
    	return -1;
    }	



    //----------------------
    readjust_surface_uv ( j , i , surface_i ) {

    	let frameindex_x, frameindex_y;
		let framesize_x, framesize_y;

		if (  this.surfaces[ j + "," + i ][0] == 1 ) {
			
			let frameindex = 0;
			if ( this.surfaces[ j + "," + (i+1) ] != null ) {
				frameindex |= 1;
			}
			if ( this.surfaces[ (j+1) + "," + (i) ] != null ) {
				frameindex |= 2;
			}
			if ( this.surfaces[ (j) + "," + (i-1) ] != null ) {
				frameindex |= 4;
			}
			if ( this.surfaces[ (j-1) + "," + (i) ] != null ) {
				frameindex |= 8;
			}

			frameindex_x = frameindex % 4;
			frameindex_y = (frameindex / 4 ) >> 0;
			framesize_x  = 0.125;
			framesize_y  = 0.125;
		
		} else if (  this.surfaces[ j + "," + i ][0] == 2 ) {
			frameindex_x = 0;
			frameindex_y = 2;
			framesize_x  = 0.25;
			framesize_y  = 0.25;
		}

		this.render_surfaces[ surface_i ].getComponent( PlaneShape ).uvs = [
			frameindex_x * framesize_x 					, frameindex_y * framesize_y ,
			frameindex_x * framesize_x 					, frameindex_y * framesize_y + framesize_y,
			frameindex_x * framesize_x + framesize_x	, frameindex_y * framesize_y + framesize_y,
			frameindex_x * framesize_x + framesize_x  	, frameindex_y * framesize_y,
			frameindex_x * framesize_x 					, frameindex_y * framesize_y ,
			frameindex_x * framesize_x 					, frameindex_y * framesize_y + framesize_y,
			frameindex_x * framesize_x + framesize_x	, frameindex_y * framesize_y + framesize_y,
			frameindex_x * framesize_x + framesize_x  	, frameindex_y * framesize_y
		]
    }




    //-----------
    readjust_object_model ( j , i , object_i ) {

    	if (  this.objectmaps[ j + "," + i ][0] != this.render_objects[ object_i ]["model"] ) {

    		this.render_objects[ object_i ].removeComponent( GLTFShape );
    			
    		if ( this.objectmaps[ j + "," + i ][0] == 1 ) {
    			// Tree
    			this.render_objects[ object_i ].addComponent( resources.models.tree );
    				
    		} else if ( this.objectmaps[ j + "," + i ][0] == 2 ) {
    			// House
    			this.render_objects[ object_i ].addComponent( resources.models.house );
    		}
    		this.render_objects[ object_i ]["model"] = this.objectmaps[ j + "," + i ][0];
    	} 
    }


    //-----------
    readjust_monster_model ( monb2d_userdata , rendermon_i ) {

    	if (  monb2d_userdata[1] != this.render_monsters[ rendermon_i ]["model"] ) {

    		this.render_monsters[ rendermon_i ].removeComponent( GLTFShape );
    			
    		if ( monb2d_userdata[1] == 1 ) {
    			this.render_monsters[ rendermon_i ].addComponent( resources.models.goblin );
    				
    		} else if (  monb2d_userdata[1] == 2 ) {
    			this.render_monsters[ rendermon_i ].addComponent( resources.models.skeleton );
    		}
    		this.render_monsters[ rendermon_i ]["model"] = monb2d_userdata[1];
    	} 
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





   










    create_npcs() {

    	let _this = this;

    	let welcomeDialog: Dialog[] = [
    		{
    			text: 'Greeting Traveller.'
    		},
    		{
    			text: 'To move your character around, left-click on the ground.'
    		},
    		{
    			text: 'To attack, left-click on the target. To cast spell (If you have learn use E on the target.)'
    		},
    		{
    			text: 'Town is located at the South. Dungeon is at the North.'
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
		    	_this.player_target.x = _this.playerb2d.GetPosition().x;
		    	_this.player_target.z = _this.playerb2d.GetPosition().y;

		    	myNPC.talk(welcomeDialog, 0);
		    },
		    {
				idleAnim: 'Walking',
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
		myNPC.getComponent( GLTFShape ).withCollisions = false;

		myNPC.setParent(this);
		myNPC["virtualPosition"] = new Vector3(0,  0.5 , 1 * this.tilesize);
		this.createStaticCircle(	
			myNPC["virtualPosition"].x,  
			myNPC["virtualPosition"].z,  
			this.tilesize / 8 , 
			this.world
		);
		this.render_npcs.push( myNPC );








		let myNPC2 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/giant.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	myNPC2.talk([
		    		{
						text: 'Wanna Buy Some Weapon?',
						isEndOfDialog: true,
						triggeredByNext: () => {
					    	_this.conversing = false;
					    }
					}
				], 0);
		    },
		    {
				idleAnim: 'Walking',
				portrait: { path: 'models/giant_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC2.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0 );
		myNPC2.getComponent( GLTFShape ).withCollisions = false;
		
		myNPC2.setParent(this);
		myNPC2["virtualPosition"] = new Vector3(-3 * this.tilesize , 0.6   , -11 * this.tilesize );
		this.createStaticCircle(	
			myNPC2["virtualPosition"].x,  
			myNPC2["virtualPosition"].z,  
			this.tilesize / 8 , 
			this.world
		);
		this.render_npcs.push( myNPC2 );





		let myNPC3 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/wizard.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	myNPC3.talk([
		    		{
						text: 'Wanna Buy Some Potions?',
						isEndOfDialog: true,
						triggeredByNext: () => {
					    	_this.conversing = false;
					    }
					}
				], 0);
		    },
		    {
				idleAnim: 'Walking',
				portrait: { path: 'models/wizard_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC3.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0 );
		myNPC3.getComponent( GLTFShape ).withCollisions = false;
		myNPC3.setParent(this);
		myNPC3["virtualPosition"] = new Vector3( 3 * this.tilesize , 0.6   , -11 * this.tilesize );
		this.createStaticCircle(	
			myNPC3["virtualPosition"].x,  
			myNPC3["virtualPosition"].z,  
			this.tilesize / 8 , 
			this.world
		);
		this.render_npcs.push( myNPC3 );





		let myNPC4 = new NPC(
		    { 
		    	position: new Vector3( 0, -999, 0),
		    	scale: new Vector3(0.15,0.15,0.15)
		    }, 
		    'models/archer.glb', 
		    () => {
		    	// On activate 
		    	_this.conversing = true;
		    	myNPC4.talk([
		    		{
						text: 'Wanna Buy Some Bows and Arrows?',
						isEndOfDialog: true,
						triggeredByNext: () => {
					    	_this.conversing = false;
					    }
					}
				], 0);
		    },
		    {
				idleAnim: 'Walking',
				portrait: { path: 'models/archer_ui.png', offsetX: 40, height: 128, width: 128  },
			    coolDownDuration: 3,
			    hoverText: 'CHAT',
			    onlyClickTrigger: true,
			    continueOnWalkAway: true,
			    onWalkAway: () => {
				
				},
			}
		)
		myNPC4.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0 );
		myNPC4.getComponent( GLTFShape ).withCollisions = false;
		myNPC4.setParent(this);
		myNPC4["virtualPosition"] = new Vector3( -2 * this.tilesize , 0.6   , -13 * this.tilesize );
		this.createStaticCircle(	
			myNPC4["virtualPosition"].x,  
			myNPC4["virtualPosition"].z,  
			this.tilesize / 8 , 
			this.world
		);
		this.render_npcs.push( myNPC4 );


    }


    //----
    addClips( animator ) {

    	animator.addClip( new AnimationState("_idle") );
		animator.addClip( new AnimationState("Walking") );
		animator.addClip( new AnimationState("Punch") );
		animator.addClip( new AnimationState("Die") );
   	}


    //----
    create_players() {


		let player = new Entity();
		player.setParent( this );
		player.addComponent( resources.models.warrior );
		player.getComponent( GLTFShape ).withCollisions = false;
		player.addComponent( new Transform( {
			position: new Vector3(0,   0.5, 0),
			scale:    new Vector3(0.15, 0.15, 0.15)
		}));
		player.addComponent( new Animator );
		this.addClips( player.getComponent(Animator ) );

		let clip = player.getComponent(Animator).getClip("_idle");
		clip.playing = true;

		let playername = new Entity();
		playername.setParent( player );
		playername.addComponent( new TextShape(this.userID) ) ;
		playername.addComponent( new Transform( {
			position: new Vector3(0, 2.5, 0),
			scale:  new Vector3( 0.5, 0.5, 0.5)
		}));
		playername.addComponent( this.shared_billboard );


		this.player = player;
		
		this.playerb2d = this.createDynamicCircle(  
			0 ,  
			0 ,  
			this.tilesize / 4 , 
			this.world, 
			false 
    	);
		


    }


    //---
    create_shared_materials() {

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

	}

    //---
    prepare_inputs() {

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

    }

    //-----
    init_box2d() {

    	this.world  		= new b2World( new b2Vec2(0, 0) );
		this.box2daabb 		= new b2AABB();
		this.box2dcallback 	= new b2QueryCallback(); 

		let _this = this;
		this.box2dcallback.ReportFixture = function( evt ) { 

			if ( evt.m_body.m_userData != null && evt.m_body.m_userData[0] == "m" ) {
				_this.monsters_in_range.push( evt.m_body );
			}
			return true;
		};

    }


	//---------
	// BOOKMARK
	init_maps() {

		
		let i, j, rnd ;
		let half_xtilecnt = (this.xtilecnt / 2 ) >> 0;
		let half_ztilecnt = (this.ztilecnt / 2 ) >> 0;

		this.init_surfaces_road();
		this.init_objects_house();

		for ( i = this.map_min.z  ; i <= this.map_max.z  ; i++ ) {
			for ( j = this.map_min.x  ; j <= this.map_max.x  ; j++ ) {

				if ( this.surfaces[ j + "," + i ] == null && this.objectmaps[ j + "," + i ] == null ) {
						
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.2 ) {
						this.objectmaps[ j + "," + i ] = [ 1 , 0 , -1 ] ;

						this.createStaticCircle(  
		    				j * this.tilesize ,  
		    				i * this.tilesize ,  
		    				this.tilesize / 8 , 
		    				this.world
		    			);
					}

					
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.4 ) {
						this.surfaces[ j + "," + i ] = [1 , 0, -1] ;
					}
					

				}
			}
		}
		
		
		

		this.spawn_monster(6,12,1);
		this.spawn_monster(7,12,2);


	}

	//-----
	init_surfaces_road() {

		let i,j;

		for ( i = -13 ; i < 10 ; i++ ) {
										// Type, reg, rendersurface_i
			this.surfaces[ 0 + "," + i ]   = [ 2 , 0, -1 ];
		}
		for ( j = -2 ; j <= 2 ; j++ ) {
			this.surfaces[ j + "," + -10 ] = [ 2 , 0, -1 ];
		}
		for ( j = -2 ; j <= 2 ; j++ ) {
			this.surfaces[ j + "," + -13 ] = [ 2 , 0, -1 ];
		}

		for ( j = 0 ; j <= 20 ; j++ ) {
			this.surfaces[ j + "," + 10 ] = [ 2 , 0, -1 ];
		} 
		for ( i = 10 ; i < 30 ; i++ ) {
			this.surfaces[ 20 + "," + i ] = [ 2 , 0, -1 ];
		}
	}

	//----
	init_objects_house() {

		this.objectmaps["-3,-10"] 	= [ 2, 0, -1 ];
		this.objectmaps["-3,-13"] 	= [ 2, 0, -1 ];
		this.objectmaps["3,-10"] 	= [ 2, 0, -1 ];
		this.objectmaps["3,-13"] 	= [ 2, 0, -1 ];
		
		for ( let coords in this.objectmaps ) {

			let tx_tz = coords.split(",")
			let tx = parseInt( tx_tz[0] );
			let tz = parseInt( tx_tz[1] );
			
			this.createStaticBox(
		    				tx * this.tilesize ,  
		    				tz * this.tilesize ,  
		    				this.tilesize ,
		    				this.tilesize, 
		    				this.world
		    			);
		}	
	}














	//-----------
	spawn_monster( x , z, type ) {

		let monsterb2d =  this.createDynamicCircle( x * this.tilesize , z * this.tilesize , this.tilesize /4 , this.world , false );
		monsterb2d.m_userData = ["m", type, 0, -1 , 0 ] ;

	}
































	//----------
    createStaticShape( x, y , vertices, world ) {
    	return this.createShape( x, y, world,  b2BodyType.b2_staticBody, vertices );
    }

     //------------
    createShape( x, y, world, body_type , vertices  ) {

    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 10;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.5;
        fixDef.shape        = new b2PolygonShape();

        fixDef.shape.Set( vertices , vertices.length );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        return b2body;
    }

    //-------------
    createDynamicBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_dynamicBody );
    }	
    //------------------
    createStaticBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_staticBody );
    }
    //-------------------
    createBox( x, y , width , height , world , body_type ) {
    	
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.00;
        fixDef.restitution  = 0.1;
        fixDef.shape        = new b2PolygonShape();
        fixDef.shape.SetAsBox( width/2 , height/2 );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;
    }

      //-------------
    createDynamicCircle( x, y , radius , world , ccd  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_dynamicBody , ccd );
    }		
	
	 //-------------
    createStaticCircle( x, y , radius , world  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_staticBody , false );
    }		

    //----------------
    createCircle( x,y, radius , world, body_type , ccd ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
        bodyDef.bullet  = ccd;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 20;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.3;
       

        fixDef.shape        = new b2CircleShape(radius);
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        b2body.SetLinearDamping(1);
		b2body.SetAngularDamping(1);


        return b2body;

    }

    //-------------
    createDynamicSensorCircle( x,y, radius , world, sensorid ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= b2BodyType.b2_dynamicBody;
        bodyDef.userData  = sensorid;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 0.0;
        fixDef.friction     = 0.0;
        fixDef.restitution  = 0.0;
        fixDef.shape        = new b2CircleShape(radius);
        fixDef.isSensor 	= true;
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;

	}

}
