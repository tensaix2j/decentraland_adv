



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


import { Txinv_and_stats } from "src/txinv_and_stats"
import { Txnpc_manager   } from "src/txnpc_manager"


export class Txstage extends Entity {

	public id;
	public userID;
	public camera;


	
	
	public vircam  			= new Vector3(0,0,0);
	public vircam_tile 		= new Vector3(0,0,0);


	public tilesize = 0.7;
	public tilegap  = 0.000;
	public xtilecnt = 19;
	public ztilecnt = 19;




	public perlin;

	public map_min = new Vector3(-40, 0, -40);
	public map_max = new Vector3( 40, 0,  80);



	// These holds entities to be put in window
	public render_objects 	= [];
	public render_surfaces 	= [];
	public render_npcs 		= [];
	public render_monsters 	= [];
	public render_players 	= [];
	public render_projectiles = [];
	public render_pickables = [];




	public objectmaps = {};
	public surfaces = {};
	// Monster map held by b2d 


	public playerb2d;
	


	public movablefloor ;
	public conversing = false;

	public shared_billboard  = new Billboard();
	public shared_planeshape = new PlaneShape();
	public sharedmats = [];
	public shared_pickable_mats = {};



	public world;
	public box2daabb;
	public box2dcallback; 
	public box2dcallback_pjt; 
	public box2dcallback_pkb;

	
	public b2d_in_range = [];

	public sounds = {};
	public debug = 0;

	public inv_and_stats ;
	public npc_manager;

	public mousedown = 0;
	public physicsCast;

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
		this.create_new_player_entity();
		this.prepare_inputs();

		
        this.perlin = new Perlin();
        this.init_maps();
        this.render_map();
        this.init_sound();
        this.inv_and_stats = new Txinv_and_stats( this );
        this.npc_manager   = new Txnpc_manager( this );
        this.npc_manager.create_npcs();

       	
        this.physicsCast = PhysicsCast.instance;
		
		this.spawn_pickables( 1 , 1 , "potion_health" );
		this.spawn_pickables( 1 , 1 , "eqp_iron_armor" );
		this.spawn_pickables( 1 , 1 , "eqp_iron_pant" );
		
		
	}	

	//------
	update(dt ) {

		this.world.Step( 0.05  , 10, 10 );


		/*		
		if ( this.mousedown == 1 ) {
			// Use this as mouse over
			let rayFromCamera = this.physicsCast.getRayFromCamera(100);
			this.physicsCast.hitFirst(
				rayFromCamera,
				(e2) => {
					this.mouseover(e2.hitPoint.x , e2.hitPoint.z);
				},
				0
			)
		}
		*/
		

		// p , , , , attacking, target_xy, target_mon, 

		if ( this.playerb2d.m_userData[10] > 0 ) {

			// Player dying..
			this.playClip(this.render_players[ 0 ].getComponent(Animator) , "Die");
			if ( this.playerb2d.m_userData[10] == 120 ) {
				this.sounds["scream"].playOnce();
			}
    		
			    		
    		if ( this.playerb2d.m_userData[10] > 1 ) {
    		
    			this.playerb2d.m_userData[10] -= 1;
    		
    		} else {
    				
    			let spawn_x = this.tilesize * -16;
    			let spawn_z = this.tilesize * -19;

    			// respawn player after die
    			this.playerb2d.SetPosition( new b2Vec2( spawn_x, spawn_z ) );
    			this.playerb2d.m_userData[8] = this.playerb2d.m_userData[9];
    			this.playerb2d.m_userData[10] = 0;

    			this.playerb2d.m_userData[5].x = this.playerb2d.GetPosition().x;
				this.playerb2d.m_userData[5].z = this.playerb2d.GetPosition().y;


    			this.render_players[ 0 ]["healthbar"].getComponent(Transform).scale.x = 0.95;
    			this.render_players[ 0 ]["healthbar"].getComponent(Transform).position.x = 0;


    			this.sounds["endgame"].playOnce();
					
    		}




		} else if ( this.playerb2d.m_userData[4] > 0 ) {
			// Player attacking .

			
			// Attacking tick at frame 20
			if ( this.playerb2d.m_userData[4] == 20 ) {

				this.playClip(this.render_players[ 0 ].getComponent(Animator) , "Punch");

				// at frame 10
			} else if ( this.playerb2d.m_userData[4] == 10 ) {

				let monb2d = this.playerb2d.m_userData[6];
				if ( monb2d != null ) {	
					// Player hit monster.	
					this.sounds["swordhit"].playOnce();
					this.monster_gethit( monb2d , this.playerb2d );
					this.playerb2d.m_userData[6] = null;
				}
			}
			this.playerb2d.m_userData[4] -= 1;
			    	

		} else {

			let diffx = this.playerb2d.m_userData[5].x - this.playerb2d.GetPosition().x;
			let diffz = this.playerb2d.m_userData[5].z - this.playerb2d.GetPosition().y;
			let speed = 0.8;

			let halftilesize = this.tilesize / 2;
			
			if ( diffx * diffx + diffz * diffz >= 0.15 * 0.15 ) {

				let rad	 = Math.atan2( diffx, diffz );
		    	let deg  = rad * 180.0 / Math.PI ;

		    	let delta_x = speed  * Math.sin(rad);
		    	let delta_z = speed  * Math.cos(rad);

		    	this.playerb2d.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );


		    	this.render_players[ 0 ].getComponent( Transform ).rotation.eulerAngles = new Vector3( 0, deg , 0 );
		    	this.playClip( this.render_players[ 0 ].getComponent(Animator) , "Walking");
		    
		    } else {
		    	this.playClip( this.render_players[ 0 ].getComponent(Animator) , "_idle");
		    	this.playerb2d.SetLinearVelocity( new b2Vec2( 0 ,0 ) );

		    }
		
		}

	    this.vircam.x = this.playerb2d.GetPosition().x;
		this.vircam.z = this.playerb2d.GetPosition().y;
		
		this.render_map();
		this.inv_and_stats.update();
		this.npc_manager.update();
	}

	//--------
	monster_gethit( monb2d , playerb2d ) {

		let rendermon_i = monb2d.m_userData[3];
		
		monb2d.m_userData[8] -= playerb2d.m_userData[7];
		
		if ( monb2d.m_userData[8] <= 0 ) {
			monb2d.m_userData[8] = 0;
			monb2d.m_userData[10] = 80;
			this.render_monsters[ rendermon_i ].removeComponent( OnPointerDown );
		}
		let healthbar_transform = this.render_monsters[ rendermon_i ]["healthbar"].getComponent(Transform);
		healthbar_transform.scale.x 	= monb2d.m_userData[8] * 0.95 / monb2d.m_userData[9] ;
		healthbar_transform.position.x 	= (monb2d.m_userData[9] - monb2d.m_userData[8]) * 0.95 / ( 2 * monb2d.m_userData[9] )
	
	}

	//-----
	player_gethit( playerb2d , monb2d ) {

		let renderplayer_i = playerb2d.m_userData[3];

		playerb2d.m_userData[8] -= monb2d.m_userData[7];
		if ( playerb2d.m_userData[8] <= 0 ) {
			playerb2d.m_userData[8] = 0;
			playerb2d.m_userData[10] = 120;
		}
		this.inv_and_stats.update_player_stats();
	}




	//--------
	is_within_distance( targetb2d , subjectb2d , range ) {

		let diffx = targetb2d.GetPosition().x - subjectb2d.GetPosition().x  ;
		let diffz = targetb2d.GetPosition().y - subjectb2d.GetPosition().y  ;
		let distsqr = diffx * diffx + diffz * diffz;

		if ( distsqr <= range * range ) {
			return 1;
		} else {
			return 0;
		}
	}	


	//-----
	find_monster_within_player() {

		let search_range_x = this.tilesize * 0.7;
		let search_range_z = this.tilesize * 0.7;

		this.box2daabb.lowerBound = new b2Vec2( this.playerb2d.GetPosition().x - search_range_x  , this.playerb2d.GetPosition().y - search_range_z  );
		this.box2daabb.upperBound = new b2Vec2( this.playerb2d.GetPosition().x + search_range_x  , this.playerb2d.GetPosition().y + search_range_z  );
		
		this.b2d_in_range.length = 0;
		this.world.QueryAABB( this.box2dcallback , this.box2daabb);
	}
















	//-------------------
	// if you can click exactly then ok, then hit the one selected.
	monster_onclick( rendermon_i ) {
		
		//log( monster_onclick );

		let monb2d = this.render_monsters[rendermon_i]["used_by"];
		if ( monb2d != null ) {

			//log("monb2d not null");
			if ( this.playerb2d.m_userData[4] == 0 ) {
				
				//log( "distsqr" ,distsqr );
		    	// p,   ,   ,  , attacking
		    	if ( this.is_within_distance( monb2d, this.playerb2d, this.tilesize * 0.7 ) == 1 ) {

		    		//log("Hitting ", rendermon_i );
		    		// Player init attack.
			    	this.playerb2d.m_userData[4] = 20;
			    	this.playerb2d.m_userData[6] = monb2d;

			    	let diffx = monb2d.GetPosition().x - this.playerb2d.GetPosition().x  ;
					let diffz = monb2d.GetPosition().y - this.playerb2d.GetPosition().y  ;

			    	let rad	 = Math.atan2( diffx, diffz );
			    	let deg  = rad * 180.0 / Math.PI ;
			    	this.playerb2d.SetLinearVelocity( new b2Vec2( 0 ,0 ) );
			    	this.render_players[ 0 ].getComponent( Transform ).rotation.eulerAngles = new Vector3( 0, deg , 0 );
			    	
			    	
			    }		
			}
		}
			
	}



	//-------------------
	// Clicking on monster is hard, so if inaccurately click still can attack.
	player_doattack( ) {
		
		
		if ( this.playerb2d.m_userData[4] == 0 ) {
			
			this.playerb2d.m_userData[5].x = this.playerb2d.GetPosition().x;
			this.playerb2d.m_userData[5].z = this.playerb2d.GetPosition().y;
			this.playerb2d.SetLinearVelocity( new b2Vec2( 0 ,0 ) );
			this.playerb2d.m_userData[4] = 20;
			
			this.find_monster_within_player();

			let i;
			
			for ( i = 0 ; i < this.b2d_in_range.length ; i++ ) {

				let monb2d = this.b2d_in_range[i];
				if ( monb2d.m_userData[10] == 0 && this.is_within_distance( monb2d, this.playerb2d, this.tilesize * 0.7 ) == 1 ) {

		    		//log("Hitting ", rendermon_i );
		    		// Player init attack.
			    	this.playerb2d.m_userData[6] = monb2d;

			    	let diffx = monb2d.GetPosition().x - this.playerb2d.GetPosition().x  ;
					let diffz = monb2d.GetPosition().y - this.playerb2d.GetPosition().y  ;

			    	let rad	 = Math.atan2( diffx, diffz );
			    	let deg  = rad * 180.0 / Math.PI ;

			    	
			    	this.render_players[ 0 ].getComponent( Transform ).rotation.eulerAngles = new Vector3( 0, deg , 0 );
			    }
		    }		
		}
		
			
	}


	//-------
	playClip( animator , clipname ) {

		animator.getClip("Punch").playing 		= false;
		animator.getClip("Die").playing 		= false;
		animator.getClip("Die").looping 		= false

		animator.getClip("_idle").playing 		= false;
		animator.getClip("Walking").playing 	= false;
		animator.getClip(clipname).playing 		= true;
	}


	//----------
	update_projectile( pjtb2d , renderpjt_i ) {
		
		if ( pjtb2d.m_userData[10] > 0 ) {
			// Dying ticks 
			if ( pjtb2d.m_userData[10] > 1 ) {
    			pjtb2d.m_userData[10] -= 1;
    		} else {
    			this.world.DestroyBody( pjtb2d );
    		}
		} else {

			let diffx = pjtb2d.m_userData[5].x - pjtb2d.GetPosition().x ;
	    	let diffz = pjtb2d.m_userData[5].z - pjtb2d.GetPosition().y ;

	    	let distsqr = diffx * diffx + diffz * diffz;
	    	let hitrange = this.tilesize * 0.5;
	    	let speed    = 3.5;

	    	let diffx_player 	= pjtb2d.GetPosition().x - this.playerb2d.GetPosition().x ;
	    	let diffy_player 	= pjtb2d.GetPosition().y - this.playerb2d.GetPosition().y ;
	    	let distsqr_player	= diffx_player * diffx_player + diffy_player * diffy_player;

	    	if ( distsqr_player <= hitrange * hitrange ) {
	    		// hit player
    			pjtb2d.m_userData[10] = 10;
    			this.sounds["arrowhit"].playOnce();
    			
    			let owner = pjtb2d.m_userData[13];
    			this.player_gethit( this.playerb2d , owner );


    		} else if ( distsqr > hitrange * hitrange  ) {
    			
    			var rad	 = Math.atan2( diffx, diffz );
			    var deg  = rad * 180.0 / Math.PI ;
			    var delta_x = speed * Math.sin(rad);
			    var delta_z = speed * Math.cos(rad);

			    pjtb2d.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );
			    this.render_projectiles[ renderpjt_i ].getComponent( Transform ).rotation.eulerAngles = new Vector3( 0, deg , 0 );
			    	

    		} else {
    			// hit nothing
    			pjtb2d.m_userData[10] = 10;
    		}
		}	
	}

    //-------------
    update_monster( monb2d , rendermon_i ) {

    	let i;

	    // m,  type ,   reg,   rendermon_i, attacking, , , ,dmg,hp,maxhp, dying
    	

    	if ( monb2d.m_userData[10] > 0 ) {
    		// Dying ticks
			this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "Die");


			if ( monb2d.m_userData[10] == 80 ) {
				if ( monb2d.m_userData[1] == 2 ) {
					// Skeleton dies
    				this.sounds["skeletonhit"].playOnce();
    			} else {
    				this.sounds["goblinscream"].playOnce();
    			}
    		}    		


    		if ( monb2d.m_userData[10] > 1 ) {
    			monb2d.m_userData[10] -= 1;
    		} else {
    			this.world.DestroyBody( monb2d );
    		}


    	} else if ( monb2d.m_userData[4] > 0 ) {

    		// Attacking ticks
    		monb2d.m_userData[4] -= 1;

    		this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "Punch");
    		
    		if ( monb2d.m_userData[4] == monb2d.m_userData[12] - 10 ) {
    			
    			if ( monb2d.m_userData[1] == 3 ) {
    				
    				// Spear goblin creates projectile here.
    				this.spawn_projectile( monb2d.GetPosition().x , monb2d.GetPosition().y , 1 , this.playerb2d.GetPosition().x, this.playerb2d.GetPosition().y , monb2d );
    				this.sounds["arrowshoot"].playOnce();

    			} else {
    				
    				// Melee
	    			let rnd = Math.random();
	    			if ( rnd < monb2d.m_userData[11] ) {
	    				// monster hit player.
	    				this.sounds["punch"].playOnce();
	    				this.player_gethit( this.playerb2d , monb2d );
	    			} else {
	    				this.sounds["growl"].playOnce();
	    			}
	    		}
    		}


    	} else {

    		let diffx = this.playerb2d.GetPosition().x - monb2d.GetPosition().x ;
	    	let diffz = this.playerb2d.GetPosition().y - monb2d.GetPosition().y  ;

	    	let range_aggro 		= this.tilesize * 6;
	    	let range_attack		= this.get_monster_attack_range( monb2d.m_userData[1] );
	    	
	    	let speed = 0.6;
	    	let distsqr = diffx * diffx + diffz * diffz;

    		// Within aggro range
	    	if ( distsqr < range_aggro * range_aggro && this.playerb2d.m_userData[10] == 0 ) {

	    		var rad	 = Math.atan2( diffx, diffz );
			    var deg  = rad * 180.0 / Math.PI ;
			    this.render_monsters[ rendermon_i ].getComponent( Transform ).rotation.eulerAngles = new Vector3( 0, deg , 0 );
			    		
	    		// Within attack range
		    	if ( distsqr > range_attack * range_attack ) {

		    		var delta_x = speed * Math.sin(rad);
			    	var delta_z = speed * Math.cos(rad);

			    	monb2d.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );

			    	this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "Walking");


			    } else {
			    	// Init attack.
			    	monb2d.SetLinearVelocity( new b2Vec2( 0 , 0 ) );
			    	this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "_idle");
			    	monb2d.m_userData[4] = monb2d.m_userData[12] ;
			    	 
			    }
			} 
		}

    }

    //----
    get_monster_attack_range( montype ) { 
    	
    	if ( montype == 3 ) {
    		return this.tilesize * 5;
    	} else { 
    		return this.tilesize * 0.6;
    	}
    }

    //-------
    get_monster_hp( montype ) {

    	let ret = 15;
    	if ( montype == 1  || montype == 3) {
    		ret = 25;
    	} else if ( montype == 2 ) {
    		ret = 10;
    	}
    	return ret;
    }

    //----
    get_monster_damage( montype ) {

    	let ret = 15;
    	if ( montype == 1  || montype == 3) {
    		ret = 2;
    	} else if ( montype == 2 ) {
    		ret = 1;
    	}
    	return ret;
    }










	//-----
	find_monster_within_window() {

		let search_range_x = this.tilesize * (this.xtilecnt / 2 >> 0) - this.tilesize ;
		let search_range_z = this.tilesize * (this.ztilecnt / 2 >> 0) - this.tilesize ;

		//log( "find_monster_AABB", this.playerb2d.GetPosition().y - search_range_z, this.playerb2d.GetPosition().y + search_range_z  );

		this.box2daabb.lowerBound = new b2Vec2( this.playerb2d.GetPosition().x - search_range_x  , this.playerb2d.GetPosition().y - search_range_z  );
		this.box2daabb.upperBound = new b2Vec2( this.playerb2d.GetPosition().x + search_range_x  , this.playerb2d.GetPosition().y + search_range_z  );
		
		this.b2d_in_range.length = 0;
		this.world.QueryAABB( this.box2dcallback , this.box2daabb);
	
	}

	//--------
	find_projectiles_within_window() {

		let search_range_x = this.tilesize * (this.xtilecnt / 2 >> 0) - this.tilesize ;
		let search_range_z = this.tilesize * (this.ztilecnt / 2 >> 0) - this.tilesize ;

		this.box2daabb.lowerBound = new b2Vec2( this.playerb2d.GetPosition().x - search_range_x  , this.playerb2d.GetPosition().y - search_range_z  );
		this.box2daabb.upperBound = new b2Vec2( this.playerb2d.GetPosition().x + search_range_x  , this.playerb2d.GetPosition().y + search_range_z  );
		
		this.b2d_in_range.length = 0;
		this.world.QueryAABB( this.box2dcallback_pjt , this.box2daabb);
	
	}

	//------
	find_pickables_within_window( ) {

		let search_range_x = this.tilesize * (this.xtilecnt / 2 >> 0) - this.tilesize ;
		let search_range_z = this.tilesize * (this.ztilecnt / 2 >> 0) - this.tilesize ;

		this.box2daabb.lowerBound = new b2Vec2( this.playerb2d.GetPosition().x - search_range_x  , this.playerb2d.GetPosition().y - search_range_z  );
		this.box2daabb.upperBound = new b2Vec2( this.playerb2d.GetPosition().x + search_range_x  , this.playerb2d.GetPosition().y + search_range_z  );
		
		this.b2d_in_range.length = 0;
		this.world.QueryAABB( this.box2dcallback_pkb , this.box2daabb);
		
	}


	//-----------
	render_map() {
		
		
		let i;
		let j;
		
		let halftilesize = this.tilesize / 2;
		let half_xtilecnt = (this.xtilecnt / 2 ) >> 0;
		let half_ztilecnt = (this.ztilecnt / 2 ) >> 0;
		

		// Player
		this.render_players[0].getComponent(Transform).position.y = 0.5 ; 
		this.render_players[0].getComponent(Transform).position.x = this.playerb2d.GetPosition().x - this.vircam.x; 
		this.render_players[0].getComponent(Transform).position.z = this.playerb2d.GetPosition().y - this.vircam.z; 



		
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

					monb2d.m_userData[2] = 0;
					//this.render_monsters[ i ].getComponent(Transform).position.y = -999; 
					engine.removeEntity( this.render_monsters[ i ] );
				 	this.render_monsters[ i ]["used_by"] = null;
					
				}
			}   
		}

		
		this.find_monster_within_window();


		for ( i = 0 ; i < this.b2d_in_range.length ; i++ ) {
			
			let monb2d = this.b2d_in_range[i];
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
				
				
				this.render_monsters[ rendermon_i ].getComponent(Transform).position.x = monb2d.GetPosition().x - this.vircam.x; 
				this.render_monsters[ rendermon_i ].getComponent(Transform).position.z = monb2d.GetPosition().y - this.vircam.z; 

				if ( monb2d.m_userData[10] > 0 && monb2d.m_userData[10] < 20 ) {
					if ( monb2d.m_userData[10] == 1 ) {
						this.render_monsters[ rendermon_i ].getComponent(Transform).position.y = -999; 
					} else {
						this.render_monsters[ rendermon_i ].getComponent(Transform).position.y = 0.5 * monb2d.m_userData[10] / 20; 
					}
				} else {
					this.render_monsters[ rendermon_i ].getComponent(Transform).position.y = 0.5 ; 
				}

				this.update_monster( monb2d , rendermon_i );
			} 
			
		}
		



		// Projectiles
		for ( i = 0 ; i < this.render_projectiles.length ; i++ ) {
			
			if ( this.render_projectiles[i]["used_by"] != null ) {
				
				let pjtb2d = this.render_projectiles[i]["used_by"];
				let pjt_x = pjtb2d.GetPosition().x ;
				let pjt_z = pjtb2d.GetPosition().y ;

				if ( 
					( pjt_x < this.vircam.x - half_xtilecnt * this.tilesize ) ||
					( pjt_x > this.vircam.x + half_xtilecnt * this.tilesize ) ||
					( pjt_z < this.vircam.z - half_ztilecnt * this.tilesize ) ||
					( pjt_z > this.vircam.z + half_ztilecnt * this.tilesize ) 
				) {

					pjtb2d.m_userData[2] = 0;
					engine.removeEntity( this.render_projectiles[ i ] );
					//this.render_projectiles[ i ].getComponent(Transform).position.y = -999;
				 	this.render_projectiles[ i ]["used_by"] = null;
					
				}
			}   
		}

		
		this.find_projectiles_within_window();

		for ( i = 0 ; i < this.b2d_in_range.length ; i++ ) {
			
			let pjtb2d = this.b2d_in_range[i];

			// m, type, reg, renderpjt_i 
			if ( pjtb2d.m_userData[2] == 0 ) {
				
				let renderpjt_i = this.get_unused_render_item_index( this.render_projectiles ) ;
				if ( renderpjt_i == -1 ) {
					renderpjt_i = this.create_new_projectile_entity();
					
				} else {
					engine.addEntity( this.render_projectiles[ renderpjt_i ] );
					
				}

				if ( renderpjt_i > -1 ) {

							
					this.render_projectiles[ renderpjt_i ]["used_by"] = pjtb2d;
					pjtb2d.m_userData[2] = 1;
					pjtb2d.m_userData[3] = renderpjt_i;
				}	

			} else {

				let renderpjt_i = pjtb2d.m_userData[3];
				
				
				this.render_projectiles[ renderpjt_i ].getComponent(Transform).position.x = pjtb2d.GetPosition().x - this.vircam.x; 
				this.render_projectiles[ renderpjt_i ].getComponent(Transform).position.z = pjtb2d.GetPosition().y - this.vircam.z; 

				if ( pjtb2d.m_userData[10] > 0 ) {
					// b2d Can be reused
					this.render_projectiles[ renderpjt_i ].getComponent(Transform).position.y = -999; 
				} else {
					this.render_projectiles[ renderpjt_i ].getComponent(Transform).position.y = 0.5 ; 
				}

				this.update_projectile( pjtb2d , renderpjt_i );
			} 
			
		}





		// Pickables
		for ( i = 0 ; i < this.render_pickables.length ; i++ ) {
			
			if ( this.render_pickables[i]["used_by"] != null ) {
				
				let pkbb2d = this.render_pickables[i]["used_by"];
				let pkb_x = pkbb2d.GetPosition().x ;
				let pkb_z = pkbb2d.GetPosition().y ;

				if ( 
					( pkb_x < this.vircam.x - half_xtilecnt * this.tilesize ) ||
					( pkb_x > this.vircam.x + half_xtilecnt * this.tilesize ) ||
					( pkb_z < this.vircam.z - half_ztilecnt * this.tilesize ) ||
					( pkb_z > this.vircam.z + half_ztilecnt * this.tilesize ) 
				) {

					pkbb2d.m_userData[2] = 0;
					engine.removeEntity( this.render_pickables[ i ] );
					//this.render_pickables[ i ].getComponent(Transform).position.y = -999;
				 	this.render_pickables[ i ]["used_by"] = null;
					
				}
			}   
		}

		
		this.find_pickables_within_window();

		for ( i = 0 ; i < this.b2d_in_range.length ; i++ ) {
			
			let pkbb2d = this.b2d_in_range[i];


			// m, type, reg, renderpkb_i 
			if ( pkbb2d.m_userData[2] == 0 ) {
				
				let renderpkb_i = this.get_unused_render_item_index( this.render_pickables ) ;
				if ( renderpkb_i == -1 ) {
					renderpkb_i = this.create_new_pickable_entity();
					
				} else {
					engine.addEntity( this.render_pickables[ renderpkb_i ] );
					
				}

				if ( renderpkb_i > -1 ) {

					this.readjust_pickable_material ( pkbb2d.m_userData , renderpkb_i );
							
					this.render_pickables[ renderpkb_i ]["used_by"] = pkbb2d;
					pkbb2d.m_userData[2] = 1;
					pkbb2d.m_userData[3] = renderpkb_i;
				}	

			} else {

				let renderpkb_i = pkbb2d.m_userData[3];
				
				
				this.render_pickables[ renderpkb_i ].getComponent(Transform).position.x = pkbb2d.GetPosition().x - this.vircam.x; 
				this.render_pickables[ renderpkb_i ].getComponent(Transform).position.z = pkbb2d.GetPosition().y - this.vircam.z; 

				if ( pkbb2d.m_userData[10] > 0 ) {
					// b2d Can be reused
					this.render_pickables[ renderpkb_i ].getComponent(Transform).position.y = -999; 
				} else {
					this.render_pickables[ renderpkb_i ].getComponent(Transform).position.y = 0.5 ; 
				}

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



	mouseover( ex, ez ) {

		//log( ex, ez );
		let transform = this.getComponent(Transform);

		this.playerb2d.m_userData[5].x = ex - transform.position.x + this.vircam.x ;
		this.playerb2d.m_userData[5].z = ez - transform.position.z + this.vircam.z ;

	}

	//----
	global_input_up(e) {
		this.mousedown = 0;

	}


    //----
	global_input_down(e) {
			
		if ( e.buttonId == 0 ) {

			if ( e.hit ) {

				this.mousedown = 1;
				
				let hitEntity = engine.entities[e.hit.entityId];

				if ( typeof hitEntity != "undefined"   ) {
					
					if ( this.conversing ) {
						return ;
					}
					if ( this.inv_and_stats.visiting_shop > 0 ) {
						return ;
					}

					let transform = this.getComponent(Transform);
					this.playerb2d.m_userData[5].x = e.hit.hitPoint.x - transform.position.x + this.vircam.x ;
					this.playerb2d.m_userData[5].z = e.hit.hitPoint.z - transform.position.z + this.vircam.z ;

					if ( this.playerb2d.m_userData[5].x < this.map_min.x * this.tilesize  ) {
						this.playerb2d.m_userData[5].x = this.map_min.x * this.tilesize;
					}
					if ( this.playerb2d.m_userData[5].x > this.map_max.x * this.tilesize) {	
						this.playerb2d.m_userData[5].x = this.map_max.x * this.tilesize;
					}
					if ( this.playerb2d.m_userData[5].z < this.map_min.z * this.tilesize) {
						this.playerb2d.m_userData[5].z = this.map_min.z * this.tilesize;
					}
					if ( this.playerb2d.m_userData[5].z > this.map_max.z * this.tilesize) {	
						this.playerb2d.m_userData[5].z = this.map_max.z * this.tilesize;
					}	
				}
				 
			}

		} else if ( e.buttonId == 1 ) {
			
			this.player_doattack();

		} else if ( e.buttonId == 2 ) {

			
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
		surfacepatch.getComponent( PlaneShape ).uvs = [
			0,0.125,
			0,0.125,
			0.125,0.125,
			0.125,0,
			0,0.125,
			0,0.125,
			0.125,0.125,
			0.125,0
		];
		
		surfacepatch.addComponent( this.sharedmats[4] );
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


    //---------------
    create_new_projectile_entity() {
    	
    	let projectile = new Entity();
    	let pjtid 	   = this.render_projectiles.length;
    	projectile.setParent( this );
    	projectile.addComponent( new Transform({
    		position: new Vector3(0, -999, 0 ),
    		scale   : new Vector3( 1 , 1, 1 )
    	}));
    	projectile.addComponent( resources.models.arrow );
    	projectile.getComponent( GLTFShape ).withCollisions = false;
    	projectile["model"] = 1;
    	this.render_projectiles.push( projectile );
		return this.render_projectiles.length - 1;

    }

    //---------------
    create_new_pickable_entity() {
    	
    	let pickable = new Entity();
    	let pkbid 	   = this.render_pickables.length;
    	let size 	   = this.tilesize / 4;

    	pickable.setParent( this );
    	pickable.addComponent( new Transform({
    		position: new Vector3(0, -999, 0 ),
    		scale   : new Vector3( size , size, size )
    	}));
    	pickable.addComponent( resources.models.generic_box );
    	pickable.getComponent( BoxShape ).withCollisions = false;
    	pickable.addComponent( this.shared_pickable_mats["potion_health"] );
    	pickable["model"] = "potion_health";
    	this.render_pickables.push( pickable );
		return this.render_pickables.length - 1;

    }


    //----
    create_new_monster_entity() {

    	let monster = new Entity();
    	let monid 	= this.render_monsters.length;
		monster.setParent( this );
		monster.addComponent( new Transform({
			position: new Vector3(0, -999,  0),
			scale   : new Vector3( 0.15, 0.15 , 0.15 )
		}));
		monster.addComponent( resources.models.skeleton );
		monster.getComponent( GLTFShape ).withCollisions = false;
		monster["model"] = 2;
		monster.addComponent( new Animator );
		let pointer = new OnPointerDown(
				(e) => {
					this.monster_onclick( monid ); 
				},{
					hoverText: "Attack"
				}
			)

		monster.addComponent(pointer);
		monster["pointer"] = pointer;
		
		this.addClips( monster.getComponent(Animator ) );
		

		let healthbarbg = new Entity();
        healthbarbg.setParent( monster );
		healthbarbg.addComponent( this.shared_planeshape );
		healthbarbg.addComponent( new Transform({
			position: new Vector3(  0,   4,   0),
			scale   : new Vector3( 1.5,   0.2,   1)
		}));
		healthbarbg.addComponent( this.shared_billboard );
		healthbarbg.addComponent( this.sharedmats[6] );
		


		let healthbar = new Entity();
        healthbar.setParent( healthbarbg );
		healthbar.addComponent( this.shared_planeshape );
		healthbar.addComponent( new Transform({
			position: new Vector3(   0,   0,   0.02),
			scale   : new Vector3( 0.95,  0.8,  1)
		}));
		healthbar.addComponent( this.shared_billboard );
		healthbar.addComponent( this.sharedmats[5] );
		monster["healthbar"] = healthbar;


		this.render_monsters.push( monster );
		return this.render_monsters.length - 1;

    }



     //----
    create_new_player_entity() {

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
			position: new Vector3(0, 3.5, 0),
			scale:  new Vector3( 0.5, 0.5, 0.5)
		}));
		playername.addComponent( this.shared_billboard );







		this.playerb2d = this.createDynamicCircle(  
			0 ,  
			0 ,  
			this.tilesize / 4 , 
			this.world, 
			false 
    	);
		this.playerb2d.m_userData = ["p", 
										0, 0,0,0, 
										new Vector3(0,0,0),
										null,
										3,
										 60,
										 60,
										 0
										 ];


		if ( this.debug == 1 ) {
			let dx = 20 * this.tilesize;
			let dz = 29 * this.tilesize;
			this.playerb2d.SetPosition( new b2Vec2( dx , dz  ) );
			this.playerb2d.m_userData[5].x = dx;
			this.playerb2d.m_userData[5].z = dz;
		}									 

		
		let healthbarbg = new Entity();
        healthbarbg.setParent( player );
		healthbarbg.addComponent( this.shared_planeshape );
		healthbarbg.addComponent( new Transform({
			position: new Vector3(  0,   3,   0),
			scale   : new Vector3( 1.5,   0.2,   1)
		}));
		healthbarbg.addComponent( this.shared_billboard );
		healthbarbg.addComponent( this.sharedmats[6] );



		let healthbar = new Entity();
        healthbar.setParent( healthbarbg );
		healthbar.addComponent( this.shared_planeshape );
		healthbar.addComponent( new Transform({
			position: new Vector3(  0,   0,   0.02),
			scale   : new Vector3( 0.95,  0.8,   1)
		}));
		healthbar.addComponent( this.shared_billboard );
		healthbar.addComponent( this.sharedmats[5] );
		player["healthbar"] = healthbar;								 	

		
		this.render_players.push( player );
		return this.render_players.length - 1;


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

		if (  this.surfaces[ j + "," + i ][0] == 1  || this.surfaces[ j + "," + i ][0] == 3 ) {
			
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
			framesize_x  = 0.125;
			framesize_y  = 0.125;
			
			frameindex_x = (frameindex % 4) ;
			frameindex_y = (frameindex / 4 ) >> 0;
			
			if ( this.surfaces[ j + "," + i ][0] == 3 ) {
				frameindex_x = (frameindex % 4) + 4;
			}


		} else if (  this.surfaces[ j + "," + i ][0] == 2 ) {
			
			framesize_x  = 0.25;
			framesize_y  = 0.25;
			frameindex_x = 0;
			frameindex_y = 2;
			
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

    	let object_type = this.objectmaps[ j + "," + i ][0];
    	if (  object_type != this.render_objects[ object_i ]["model"] ) {

    		this.render_objects[ object_i ].removeComponent( GLTFShape );
    		
    		this.render_objects[ object_i ].getComponent( Transform ).scale.y = 1;

    		if ( object_type == 1 ) {
    			this.render_objects[ object_i ].addComponent( resources.models.tree );
    				
    		} else if ( object_type == 2 ) {
    			this.render_objects[ object_i ].addComponent( resources.models.house );
    		
    		} else if (object_type == 3 ) {
    			this.render_objects[ object_i ].addComponent( resources.models.tombstone );
    			
    		}  else if ( object_type == 4 ) {
    			
    			let wallheight =  this.objectmaps[ j + "," + i ][3];
    			this.render_objects[ object_i ].getComponent( Transform ).scale.y = wallheight + 1;
    			this.render_objects[ object_i ].addComponent( resources.models.cubeblock );
    			
    		}
    		this.render_objects[ object_i ]["model"] = this.objectmaps[ j + "," + i ][0];
    	} 
    }


    //----------------------
    readjust_projectile_model( pjtb2d_userdata, renderpjt_i ) {

    	if (  pjtb2d_userdata[1] != this.render_projectiles[ renderpjt_i ]["model"] ) {

    		this.render_projectiles[ renderpjt_i ].removeComponent( GLTFShape );
    		if ( pjtb2d_userdata[1] == 1 ) {
    			this.render_projectiles[ renderpjt_i ].addComponent( resources.models.arrow );
    		} 
    		this.render_projectiles[ renderpjt_i ]["model"] = pjtb2d_userdata[1];
    	} 

    }

    readjust_pickable_material ( pkbb2d_userdata , renderpkb_i ) {

    	if (  pkbb2d_userdata[1] != this.render_pickables[ renderpkb_i ]["model"] ) {

    		this.render_pickables[ renderpkb_i ].removeComponent( Material );
    		this.render_pickables[ renderpkb_i ].addComponent( this.shared_pickable_mats[ pkbb2d_userdata[1] ] );
    		this.render_pickables[ renderpkb_i ]["model"] = pkbb2d_userdata[1];
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
    		
    		} else if (  monb2d_userdata[1] == 3 ) {
    			this.render_monsters[ rendermon_i ].addComponent( resources.models.goblinspear );
    		}




    		this.render_monsters[ rendermon_i ]["model"] = monb2d_userdata[1];
    	} 

    	let healthbar_transform = this.render_monsters[ rendermon_i ]["healthbar"].getComponent(Transform);
		healthbar_transform.scale.x 	= monb2d_userdata[8] * 0.95 / monb2d_userdata[9] ;
		healthbar_transform.position.x 	= (monb2d_userdata[9] - monb2d_userdata[8]) * 0.95 / ( 2 * monb2d_userdata[9] )
		
		if ( !this.render_monsters[ rendermon_i ].hasComponent( OnPointerDown ) ) {
    		this.render_monsters[ rendermon_i ].addComponent( this.render_monsters[ rendermon_i ]["pointer"] );
    	}
    	this.playClip(  this.render_monsters[ rendermon_i ].getComponent( Animator) , "_idle");
    	
    	
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
		floor.addComponent( this.sharedmats[1] );
		
		let movablefloor = new Entity();
		movablefloor.setParent( this );
		movablefloor.addComponent( new PlaneShape() );
		movablefloor.getComponent( PlaneShape ).withCollisions = false;

		movablefloor.addComponent( new Transform( {
			position: new Vector3(0, this.tilesize / 2 , 0),
			scale   : new Vector3( this.tilesize * this.xtilecnt , this.tilesize * this.ztilecnt , 1 )
		}));
		movablefloor.getComponent(Transform).rotation.eulerAngles = new Vector3(90,0,0);

		movablefloor.addComponent( this.sharedmats[2] );
			
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
		borderbox.addComponent( this.sharedmats[1] );


		borderbox = new Entity();
		borderbox.setParent( this );
		borderbox.addComponent( new BoxShape() );
		borderbox.addComponent( new Transform({
			position: new Vector3(0, y, -half_ztilecnt * this.tilesize ),
			scale: new Vector3( this.tilesize * (this.xtilecnt+1) , this.tilesize * 3.2 , this.tilesize * 2 )
		}));
		borderbox.addComponent( this.sharedmats[1] );

		borderbox = new Entity();
		borderbox.setParent( this );
		borderbox.addComponent( new BoxShape() );
		borderbox.addComponent( new Transform({
			position: new Vector3( -half_xtilecnt * this.tilesize ,y, 0 ),
			scale: new Vector3( this.tilesize * 2  , this.tilesize * 3.2 , this.tilesize * this.ztilecnt)
		}));
		borderbox.addComponent( this.sharedmats[1] );

		borderbox = new Entity();
		borderbox.setParent( this );
		borderbox.addComponent( new BoxShape() );
		borderbox.addComponent( new Transform({
			position: new Vector3( half_xtilecnt * this.tilesize ,y, 0 ),
			scale: new Vector3( this.tilesize * 2  , this.tilesize * 3.2 , this.tilesize * this.ztilecnt)
		}));
		borderbox.addComponent( this.sharedmats[1] );
		
    }





    //----
    addClips( animator ) {

    	animator.addClip( new AnimationState("_idle") );
		animator.addClip( new AnimationState("Walking") );
		animator.addClip( new AnimationState("Punch") );
		animator.addClip( new AnimationState("Die") );
   	}


   

    //---
    create_shared_materials() {

		let sharedmat = new Material();
		sharedmat.albedoColor = Color3.FromInts( 230, 255, 255);
		this.sharedmats.push( sharedmat );

		let sharedmat2 = new Material();
		sharedmat2.albedoColor = Color3.FromInts(76,52,26);
		sharedmat2.specularIntensity = 0;
		sharedmat2.roughness = 1;
		this.sharedmats.push( sharedmat2 );
		
		let sharedmat3 = new Material();
		sharedmat3.albedoTexture = resources.textures.floor;
		sharedmat3.specularIntensity = 0;
		sharedmat3.roughness = 1;
		this.sharedmats.push( sharedmat3 );
		
		let sharedmat4 = new Material();
		sharedmat4.albedoColor = Color3.FromInts(76,52,26);
		sharedmat4.specularIntensity = 0;
		sharedmat4.roughness = 1;
		this.sharedmats.push( sharedmat4 );

		let sharedmat5 = new Material();
		sharedmat5.albedoTexture = resources.textures.surfacepatch;
		sharedmat5.bumpTexture = resources.textures.surfacepatch;
		sharedmat5.specularIntensity = 0;
		sharedmat5.roughness = 1;
		sharedmat5.transparencyMode = 1;
		this.sharedmats.push( sharedmat5 );

		let sharedmat6 = new Material();
		sharedmat6.albedoColor = Color3.FromInts(255,0,0);
		sharedmat6.specularIntensity = 0;
		sharedmat6.roughness = 1;
		this.sharedmats.push( sharedmat6 );	

		let sharedmat7 = new Material();
		sharedmat7.albedoColor = Color3.FromInts(88,44,44);
		sharedmat7.specularIntensity = 0;
		sharedmat7.roughness = 1;
		this.sharedmats.push( sharedmat7 );	

		let texture;
		for ( texture in resources.textures ) {
			
			let texture_name_parts = texture.split("_");
			if ( texture_name_parts[0] == "eqp" || texture_name_parts[0] == "potion" ) {
				this.shared_pickable_mats[ texture ] = new Material();
				this.shared_pickable_mats[ texture ].albedoTexture = resources.textures[texture];
				this.shared_pickable_mats[ texture ].specularIntensity = 0;
				this.shared_pickable_mats[ texture ].roughness = 1;
			}
		}


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
				_this.b2d_in_range.push( evt.m_body );
			}
			return true;
		};

		this.box2dcallback_pjt = new b2QueryCallback();
		this.box2dcallback_pjt.ReportFixture = function( evt ) { 

			if ( evt.m_body.m_userData != null && evt.m_body.m_userData[0] == "pjt" ) {
				_this.b2d_in_range.push( evt.m_body );
			}
			return true;
		};


		this.box2dcallback_pkb = new b2QueryCallback();
		this.box2dcallback_pkb.ReportFixture = function( evt ) { 

			if ( evt.m_body.m_userData != null && evt.m_body.m_userData[0] == "pkb" ) {
				_this.b2d_in_range.push( evt.m_body );
			}
			return true;
		};		

    }




    //---------------
    init_sound( ) {
    	let snd ;
        for ( snd in resources.sounds ) {
            this.sounds[snd]     = new Txsound(this, resources.sounds[snd] );
        }    

    }



	//---------
	// BOOKMARK
	init_maps() {

		
		let i, j, rnd ;
		let half_xtilecnt = (this.xtilecnt / 2 ) >> 0;
		let half_ztilecnt = (this.ztilecnt / 2 ) >> 0;

		this.init_surfaces_road();
		this.init_cemetery();
		this.init_objects_house();
		this.init_dungeon();

		for ( i = this.map_min.z  ; i <= this.map_max.z  ; i++ ) {
			for ( j = this.map_min.x  ; j <= this.map_max.x  ; j++ ) {

				let inside_dungeon = 0;
				if ( j >= 5 && j <= 40 && i>= 30 && i <=75 ) {
					// Dungeon
					inside_dungeon = 1;
				}

				if ( inside_dungeon == 1 ) {

					if ( this.objectmaps[ j + "," + i ] == null ) {
						rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
						if ( rnd < 0.3 ) {
							this.surfaces[ j + "," + i ] = [3 , 0, -1] ;
						}
					}

				} else {
					if ( this.surfaces[ j + "," + i ] == null && this.objectmaps[ j + "," + i ] == null  ) {
							
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
		}
		
		this.init_monsters();
	}

	//-----
	init_surfaces_road() {

		let i,j;

		for ( i = -19 ; i < 10 ; i++ ) {
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


		for ( j = -13 ; j <= 0 ; j++ ) {
			this.surfaces[ j + "," + -19 ] = [ 2 , 0, -1 ];
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

	//---
	init_cemetery() {
		
		let i,j;
		for ( i = -21 ; i <= -17 ; i++ ) {
			for ( j = -18; j <= -14 ; j++ ) {
				this.surfaces[ j + "," + i ] = [ 3 , 0, -1 ];
			}
		}

		let coords = [ 
			[-15,-18],
			[-15,-20],
			[-17,-18],
			[-17,-20]
		];
			
		for ( i = 0 ; i < coords.length ; i++ ) {
			this.objectmaps[ coords[i][0] + "," + coords[i][1] ] 	= [ 3, 0, -1 ];
			this.createStaticBox(
		    				coords[i][0] * this.tilesize ,  
		    				coords[i][1] * this.tilesize ,  
		    				this.tilesize/2 ,
		    				this.tilesize/2, 
		    				this.world
		    			);
		}
	}





	//-----------------------
	init_monsters() {

		let coords = [
			[ 6 , 12 , 1 , 3  ],

			// skele
			[ 12 , 6 , 2 , 2  ],
			
			[ 22 , 3 , 1 , 3  ],
			[ 30 , 3 , 1 , 3  ],
			
			[ 20 , -10 , 1 , 4  ],
			[ 30 , -10 , 1 , 4  ],

			[ 20 , -20 , 1 , 4  ],
			[ 30 , -20 , 1 , 4  ],

			[ 20 , 10 , 1 , 5  ],
			[ 30 , 10 , 1 , 5  ],

			[ 20 , 20 , 1 , 5  ],
			[ 30 , 20 , 1 , 5  ],
			
			[ -20 , 0 , 1 , 5  ],
			[ -30 , 0 , 1 , 5  ],
			[ -20 , 10 , 1 , 5  ],
			[ -30 , 10 , 1 , 5  ],
			[ -20 , 20 , 1 , 5  ],
			[ -30 , 20 , 1 , 5  ],

			[ -20 , -40 , 2 , 5  ],
			[ -30 , -40 , 2 , 5  ],

			[ -34 , -23 , 2 , 5  ],
			[  27 , -35 , 1 , 5  ],
			[   0 ,  35 , 1 , 5  ],
			
			[ -20 , 20 , 1 , 5  ],
			[ -30 , 20 , 1 , 5  ],

			[ -35 , 29 , 1 , 5  ],


			[ 18, 2 , 3,  1 ],
											
		]	

		let i, j ;
		for ( i = 0 ; i < coords.length ; i++ ) {

			let cx = coords[i][0];
			let cz = coords[i][1];
			let type = coords[i][2];
			let num_of_mons = coords[i][3];

			for ( j = 0 ; j < num_of_mons ; j++ ) {
				
				let mx = cx + Math.random() * 0.5 - 0.25;
				let mz = cz + Math.random() * 0.5 - 0.25;

				if ( type == 1 && j >= 2 ) {
					//Add some spear goblin to the pack
					type = 3;
				} 
				this.spawn_monster( mx  * this.tilesize , mz  * this.tilesize  , type );
			}
		}


	}


	//---------------------
	init_dungeon() {
		let i, j ;

		


		for ( i = 30 ; i <= 75 ; i++ ) {
			for ( j = 5 ; j <= 40 ; j++ ) {

				if ( j == 20 && i >= 30 && i <= 50 ) {
					// Narrow corridor into the cave


				} else if ( j >= 19 &&  j <= 21 && i >= 54 && i <= 61 ) {
					// Narrow corridor into the last room



				} else if ( j >= 13 &&  j <= 13 && i >= 47 && i <= 48 ) {
					// Narrow corridor into the left room1
				
				} else if ( j >= 13 &&  j <= 15 && i >= 49 && i <= 50 ) {
					// Narrow corridor into the left room1
					
			
				} else if ( j >= 7 &&  j <= 9 && i >= 41 && i <= 41 ) {
					// Narrow corridor into the left room2
				
				} else if ( j >= 7 &&  j <= 8 && i >= 54 && i <= 54 ) {
					// Narrow corridor into the left room2
								

				} else if ( j >= 6 &&  j <= 6 && i >= 41 && i <= 54 ) {
					// Narrow corridor into the left room2


				
				} else if ( j >= 31 &&  j <= 34 && i >= 42 && i <= 43 ) {
					// Narrow corridor into the right room1


				} else if ( j >= 25 &&  j <= 25 && i >= 46 && i <= 48 ) {
					// Narrow corridor into the right room1
				
				} else if ( j >= 13 &&  j <= 15 && i >= 49 && i <= 50 ) {
					// Narrow corridor into the right room1
				
				
				} else if ( j >= 31 &&  j <= 34 && i >= 42 && i <= 43 ) {
					// Narrow corridor into the right room2
					
				} else if ( j >= 35 &&  j <= 36 && i >= 42 && i <= 55 ) {
					// Narrow corridor into the right room2
					

				} else if ( j >= 11 && j <= 31 && i >= 62 && i <= 71  ) {	
					// Last Big room

				} else if ( j >= 16 && j <= 25 && i >= 49 && i <= 53  ) {	
					// middle room
				
				

				} else if ( j >= 10 && j <= 16 && i >= 40 && i <= 46  ) {	
					// left room1

					
				} else if ( j >= 9 && j <= 12 && i >= 53 && i <= 56  ) {	
					// left room2

				} else if ( j >= 25 && j <= 30 && i >= 40 && i <= 45  ) {	
					// right room1
				} else if ( j >= 32 && j <= 36 && i >= 56 && i <= 57  ) {	
					// right room2
										

				} else {

					let wallheight = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;

					this.objectmaps[ j + "," + i ] 	= [ 4 , 0, -1 , wallheight ];
					this.createStaticBox(
			    				j * this.tilesize  ,  
			    				i * this.tilesize  ,  
			    				this.tilesize ,
			    				this.tilesize, 
			    				this.world
			    			);

				}

			}
		}
	}


	//-------------
	spawn_projectile( x , z, type , dst_x, dst_z , owner_b2d ) {

		let projectileb2d = this.createDynamicSensorCircle( x , z , this.tilesize/4 , this.world, 1 );

		// pjt  type  reg  renderpjt_i , reserve, target_xz
		projectileb2d.m_userData = [ "pjt" ,  type , 0, -1 , 0 , new Vector3(dst_x, 0 , dst_z ),
					0,   //6
					0,   //7
					0,   
					0,
					0,
					0,
					0,  
					owner_b2d // 13. owner
					 ];


	}


	//-------------
	spawn_pickables( x , z, type  ) {

		let pkbb2d = this.createDynamicBox( x , z , this.tilesize/4, this.tilesize/4 , this.world );

		pkbb2d.SetLinearDamping(10);

		// pjt  type  reg  renderpkb_i 
		pkbb2d.m_userData = [ "pkb" ,  type , 0, -1  ];

	}



	//-----------
	spawn_monster( x , z, type ) {

		let monsterb2d =  this.createDynamicCircle( x  , z  , this.tilesize /4 , this.world , false );


		/*	
			type 1: goblin 
			type 2: skeleton 
			type 3: spear goblin
	

		*/

		let attackduration = 20;
		let dmg = this.get_monster_damage( type );
		let hp  = this.get_monster_hp( type );

								// m  type  reg  rendermon_i , attacking,   reserve, reseve, damage, hp, maxhp
		monsterb2d.m_userData = [ 
								  "m", 
								  type,   
								   0,          
								  -1,         
								  
								  0,   //4. attacking 
								  0,   //5.reserve  
								  0,   //6. reserve    
								  
								  dmg,    //7.dmg  
								  hp,    //8.hp
								  hp,     //9.maxhp
								  0,     //10. dying tick
								  0.5, 	//11. hitrate	
								  attackduration    //12. attackduration
								 ] ;


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
        fixDef.density      = 10.0;
        fixDef.friction     = 1;
        fixDef.restitution  = 0.0;
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
