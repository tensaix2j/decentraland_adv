

import { Perlin } from "src/perlin";

export class Txmap_manager {

	public stage ;
	public perlin;

							//    x   y    z
	public map_min = new Vector3(-80, 0, -120);
	public map_max = new Vector3( 80, 0,  80);


	public snow_area_min = new Vector3(-40,0,-40);
	public snow_area_max = new Vector3( 40, 0,40);

	public dungeon_area_min = new Vector3( 5, 0, 30);
	public dungeon_area_max = new Vector3( 40,0, 85);
	
	public d1_area_min = new Vector3( -80, 0, -30);
	public d1_area_max = new Vector3( -40, 0,  80);
	
	public d2_area_min = new Vector3( -80, 0, -80);
	public d2_area_max = new Vector3( -30, 0, -30);

	public d3_area_min = new Vector3( -30, 0, -80);
	public d3_area_max = new Vector3(  80, 0, -30);

	public d4_area_min = new Vector3(  40, 0, -30);
	public d4_area_max = new Vector3(  80, 0,  80);


	constructor( stage ) {
		this.stage = stage;
		this.perlin = new Perlin();
        
	}

	init_maps() {

		this.init_surfaces_road();
		this.init_cemetery();
		this.init_goblinvillage();
		this.init_objects_house();
		this.init_dungeon();
		this.init_floors();


		this.init_monsters();
		this.init_prizes() ;
	}



	//----------------
	init_floors() {

		let i, j, rnd ;
		let half_xtilecnt = (this.stage.xtilecnt / 2 ) >> 0;
		let half_ztilecnt = (this.stage.ztilecnt / 2 ) >> 0;

		// Snoware floor
		for ( i = this.snow_area_min.z  ; i <= this.snow_area_max.z  ; i++ ) {
			for ( j = this.snow_area_min.x  ; j <= this.snow_area_max.x  ; j++ ) {

				let dungeon_area = 0;
				if ( j >= this.dungeon_area_min.x && j <= this.dungeon_area_max.x && 
					 i >= this.dungeon_area_min.z && i <= this.dungeon_area_max.z ) {
					// Dungeon
					dungeon_area = 1;
				}


				if ( dungeon_area == 0 ) {
				
					if ( this.stage.surfaces[ j + "," + i ] == null && this.stage.objectmaps[ j + "," + i ] == null  ) {
							
						rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
						if ( rnd < 0.2 ) {

							// Trees
							this.stage.objectmaps[ j + "," + i ] = [ 1 , 0 , -1 ] ;

							this.stage.createStaticCircle(  
			    				j * this.stage.tilesize ,  
			    				i * this.stage.tilesize ,  
			    				this.stage.tilesize / 8 , 
			    				this.stage.world
			    			);
						}

						rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
						if ( rnd < 0.4 ) {
							// snows
							this.stage.surfaces[ j + "," + i ] = [1 , 0, -1] ;
						}
					}
				}
			}
		}

		// Dungeon floor
		for ( i = this.dungeon_area_min.z ; i <= this.dungeon_area_max.z ; i++ ) {
			for ( j = this.dungeon_area_min.x ; j <= this.dungeon_area_max.x ; j++ ) {
				if ( this.stage.objectmaps[ j + "," + i ] == null ) {
				
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.3 ) {
						this.stage.surfaces[ j + "," + i ] = [3 , 0, -1] ;
					}
				}

			}
		}


		// D1 Zone
		for ( i = this.d1_area_min.z ; i <= this.d1_area_max.z ; i++ ) {
			for ( j = this.d1_area_min.x ; j <= this.d1_area_max.x ; j++ ) {

				if ( this.stage.objectmaps[ j + "," + i ] == null ) {
					
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.2 ) {

						// Trees
						this.stage.objectmaps[ j + "," + i ] = [ 1 , 0 , -1 ] ;

						this.stage.createStaticCircle(  
		    				j * this.stage.tilesize ,  
		    				i * this.stage.tilesize ,  
		    				this.stage.tilesize / 8 , 
		    				this.stage.world
		    			);
					}

					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.3 ) {
						this.stage.surfaces[ j + "," + i ] = [3 , 0, -1] ;
					}
				}
			}
		}

		// D2 Zone
		for ( i = this.d2_area_min.z ; i <= this.d2_area_max.z ; i++ ) {
			for ( j = this.d2_area_min.x ; j <= this.d2_area_max.x ; j++ ) {

				if ( this.stage.objectmaps[ j + "," + i ] == null ) {
					
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.2 ) {

						// Trees
						this.stage.objectmaps[ j + "," + i ] = [ 1 , 0 , -1 ] ;

						this.stage.createStaticCircle(  
		    				j * this.stage.tilesize ,  
		    				i * this.stage.tilesize ,  
		    				this.stage.tilesize / 8 , 
		    				this.stage.world
		    			);
					}

					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.3 ) {
						this.stage.surfaces[ j + "," + i ] = [3 , 0, -1] ;
					}
				}
			}
		}

		// D3 Zone
		for ( i = this.d3_area_min.z ; i <= this.d3_area_max.z ; i++ ) {
			for ( j = this.d3_area_min.x ; j <= this.d3_area_max.x ; j++ ) {

				if ( this.stage.objectmaps[ j + "," + i ] == null ) {
					
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.2 ) {

						// Trees
						this.stage.objectmaps[ j + "," + i ] = [ 1 , 0 , -1 ] ;

						this.stage.createStaticCircle(  
		    				j * this.stage.tilesize ,  
		    				i * this.stage.tilesize ,  
		    				this.stage.tilesize / 8 , 
		    				this.stage.world
		    			);
					}

					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.3 ) {
						this.stage.surfaces[ j + "," + i ] = [3 , 0, -1] ;
					}
				}
			}
		}

		// D4 Zone
		for ( i = this.d4_area_min.z ; i <= this.d4_area_max.z ; i++ ) {
			for ( j = this.d4_area_min.x ; j <= this.d4_area_max.x ; j++ ) {

				if ( this.stage.objectmaps[ j + "," + i ] == null ) {
					
					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.2 ) {

						// Trees
						this.stage.objectmaps[ j + "," + i ] = [ 1 , 0 , -1 ] ;

						this.stage.createStaticCircle(  
		    				j * this.stage.tilesize ,  
		    				i * this.stage.tilesize ,  
		    				this.stage.tilesize / 8 , 
		    				this.stage.world
		    			);
					}

					rnd = ( this.perlin.simplex2( j , i )  + 1 ) * 0.5;
					if ( rnd < 0.3 ) {
						this.stage.surfaces[ j + "," + i ] = [3 , 0, -1] ;
					}
				}
			}
		}


	}








	//----
	init_prizes() {

		this.stage.spawn_pickables( 1 , 1 , this.stage.inv_and_stats.gen_random_armor() );
		this.stage.spawn_pickables( 1 , 1 , this.stage.inv_and_stats.gen_random_weapon() );
		this.stage.spawn_pickables( 1 , 1 , this.stage.inv_and_stats.gen_random_potion() );
		
		let coords = [ 
			[-2,-1],
			[-5,-4],
			[-7,-8],
			[ 1,-16],
			[-6,3],
			[-8,6],
			[-11,3],
			[-9,-3],
			[-13,-4],
			[-8,-9]
		];
		
		let i;	
		for ( i = 0 ; i < coords.length ; i++ ) {
			let rndamt = ((Math.random() * 30) >> 0 ) + 10 ;
			this.stage.spawn_pickables(  coords[i][0] * this.stage.tilesize , coords[i][1] * this.stage.tilesize , ["item_money" , rndamt ] );
		}


		for ( i = 0 ; i < 5 ; i++ ) {
			this.stage.spawn_pickables( 10 * this.stage.tilesize  + Math.random()* 0.02-0.01, 54* this.stage.tilesize + Math.random()* 0.02-0.01 , this.stage.inv_and_stats.gen_random_potion() );
		}
		for ( i = 0 ; i < 5 ; i++ ) {
			this.stage.spawn_pickables( 10 * this.stage.tilesize  + Math.random()* 0.02-0.01, 54* this.stage.tilesize  + Math.random()* 0.02-0.01 , this.stage.inv_and_stats.gen_random_weapon() );
		}

		for ( i = 0 ; i < 5 ; i++ ) {
			this.stage.spawn_pickables( 33 * this.stage.tilesize  + Math.random()* 0.02-0.01 , 57* this.stage.tilesize  + Math.random()* 0.02-0.01, this.stage.inv_and_stats.gen_random_potion() );
		}
		for ( i = 0 ; i < 5 ; i++ ) {
			this.stage.spawn_pickables( 33 * this.stage.tilesize  + Math.random()* 0.02-0.01,  57 * this.stage.tilesize  + Math.random()* 0.02-0.01, this.stage.inv_and_stats.gen_random_armor() );
		}
						
	}


	//-----
	init_surfaces_road() {

		let i,j;

		for ( i = -19 ; i < 10 ; i++ ) {
										// Type, reg, rendersurface_i
			this.stage.surfaces[ 0 + "," + i ]   = [ 2 , 0, -1 ];
		}
		for ( j = -3 ; j <= 3 ; j++ ) {
			this.stage.surfaces[ j + "," + -11 ] = [ 2 , 0, -1 ];
		}
		for ( j = -3 ; j <= 3 ; j++ ) {
			this.stage.surfaces[ j + "," + -14 ] = [ 2 , 0, -1 ];
		}

		for ( j = 0 ; j <= 20 ; j++ ) {
			this.stage.surfaces[ j + "," + 10 ] = [ 2 , 0, -1 ];
		} 
		for ( i = 10 ; i < 30 ; i++ ) {
			this.stage.surfaces[ 20 + "," + i ] = [ 2 , 0, -1 ];
		}


		for ( j = -13 ; j <= 0 ; j++ ) {
			this.stage.surfaces[ j + "," + -19 ] = [ 2 , 0, -1 ];
		
		}

		for ( j = 1 ; j <= 3 ; j++ ) {
			this.stage.surfaces[ j + "," + -6 ] = [ 2 , 0, -1 ];
		}

		

	}

	//----
	init_objects_house() {

		let i;
		let coords = [ 
			[-3,-10],
			[-3,-13],
			[ 3,-10],
			[ 3,-13],
			[ 3, -5]
		];

		for ( i = 0 ; i < coords.length ; i++ ) {

			let tx = coords[i][0] ;
			let tz = coords[i][1] ;
			
			this.stage.objectmaps[ tx + "," + tz ] = [ 2, 0 , -1] ;
			this.stage.createStaticBox(
		    				tx * this.stage.tilesize ,  
		    				tz * this.stage.tilesize ,  
		    				this.stage.tilesize ,
		    				this.stage.tilesize, 
		    				this.stage.world
		    			);



		}	

		// roadsign
		this.stage.objectmaps[ "2,1" ] = [ 6, 0 , -1] ;
		this.stage.createStaticBox(
	    				2 * this.stage.tilesize ,  
	    				1 * this.stage.tilesize ,  
	    				this.stage.tilesize/2 ,
	    				this.stage.tilesize/2, 
	    				this.stage.world
	    			);


	}

	//----------
	init_goblinvillage() {
		
		let coords = [ 
			[ 20,-46],
			[ 24,-46],
			[ 20,-50],
			[ 24,-50]
		];
		let i;
		for ( i = 0 ; i < coords.length ; i++ ) {
			this.stage.objectmaps[ coords[i][0] + "," + coords[i][1] ] 	= [ 5, 0, -1 ];
			this.stage.createStaticBox(
		    				coords[i][0] * this.stage.tilesize ,  
		    				coords[i][1] * this.stage.tilesize ,  
		    				this.stage.tilesize/2 ,
		    				this.stage.tilesize/2, 
		    				this.stage.world
		    			);
		}
	}
	
	//---
	init_cemetery() {
		
		let i,j;
		for ( i = -21 ; i <= -17 ; i++ ) {
			for ( j = -18; j <= -14 ; j++ ) {
				this.stage.surfaces[ j + "," + i ] = [ 3 , 0, -1 ];
			}
		}

		let coords = [ 
			[-15,-18],
			[-15,-20],
			[-17,-18],
			[-17,-20]
		];
			
		for ( i = 0 ; i < coords.length ; i++ ) {
			this.stage.objectmaps[ coords[i][0] + "," + coords[i][1] ] 	= [ 3, 0, -1 ];
			this.stage.createStaticBox(
		    				coords[i][0] * this.stage.tilesize ,  
		    				coords[i][1] * this.stage.tilesize ,  
		    				this.stage.tilesize/2 ,
		    				this.stage.tilesize/2, 
		    				this.stage.world
		    			);
		}


		// Skeleton king's cemetery
		for ( i = -49 ; i <= -38 ; i++ ) {
			for ( j = -48; j <= -43 ; j++ ) {
				this.stage.surfaces[ j + "," + i ] = [ 3 , 0, -1 ];
			}
		}

		coords = [ 
			[-47,-39],
			[-47,-42],
			[-47,-45],
			[-47,-48]
		];

		for ( i = 0 ; i < coords.length ; i++ ) {
			this.stage.objectmaps[ coords[i][0] + "," + coords[i][1] ] 	= [ 3, 0, -1 ];
			this.stage.createStaticBox(
		    				coords[i][0] * this.stage.tilesize ,  
		    				coords[i][1] * this.stage.tilesize ,  
		    				this.stage.tilesize/2 ,
		    				this.stage.tilesize/2, 
		    				this.stage.world
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
			

			[ -30 , -30 , 5 , 3  ],
			[ -30 ,  -8 , 5 , 5  ],
			[ -40 ,  -4 , 5 , 3  ],
			[ -48 ,   5 , 5 , 5  ],
			[ -44 ,  18 , 5 , 3  ],
			[ -51 ,  20 , 5 , 5  ],
			[ -60 ,   8 , 5 , 3  ],
			[ -60 ,  -7 , 5 , 5  ],
			[ -58 , -20 , 5,  3 ],
			[ -58 ,  -35 , 5 , 5  ],
			[ -56 ,  -48 , 5 , 3  ],
			[ -47 ,  -55 , 5 , 5  ],
			[ -38 , -48 , 5, 3 ],
			[ -38 , -38 , 5, 5 ],
			[ -45, -30 , 5, 3 ],
			[ -47 , -14 , 5, 5 ],
			[ -33 , -70 , 5, 4 ],
			[ -26 , -64 , 5, 3 ],
			[ -9 , -63 , 5, 3 ],	
			[ -3 , -71 , 5 , 5 ],
			[  10 , -71 , 5 , 4 ],
			[ 25, -70 , 5, 4 ],
			[ 34, -64, 5, 4 ],
			[ 33, -53 , 5 ,3 ],
			[ 36, -41 , 5 , 3 ],
			[ 38, -29 , 5 , 3 ],
			[ 42, -18 , 5 , 3 ],
			[ 47, -2 , 5 , 3 ],
			[ 49, 12 , 5 , 3 ],
			[ 45, 24 , 5 , 3 ],
			[ 49, 34 , 5 , 3 ],
			[ 50, 46 , 5 , 3 ],
			[ 50, 56 , 5 , 3 ],
			[ 57, 71 , 5 , 3 ],
			[ 65, 75 , 5 , 3 ],


			[ -1, -45 , 2 , 3 ],
			[ 10, -43 , 2 , 3 ],
			
			[ 13, -43, 6, 5 ]

				
				
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
				this.stage.spawn_monster( mx  * this.stage.tilesize , mz  * this.stage.tilesize  , type );
			}
		}


		// Boss 1 : skeleton king:
		this.stage.spawn_monster( -45  * this.stage.tilesize , -44  * this.stage.tilesize  , 12 );
		//this.stage.spawn_monster(  0  * this.stage.tilesize , -63  * this.stage.tilesize  , 12 );


		// Boss 2: Goblin king.
		this.stage.spawn_monster( 16  * this.stage.tilesize ,  -48  * this.stage.tilesize  , 14 );
		

		// Boss 3: Wizard master
		this.stage.spawn_monster(  23  * this.stage.tilesize ,  71  * this.stage.tilesize  , 13 );
		

		

		// Dark wizards
		this.stage.spawn_monster( 18  * this.stage.tilesize , 51  * this.stage.tilesize  , 4 );
		this.stage.spawn_monster( 23  * this.stage.tilesize , 51  * this.stage.tilesize  , 4 );
		this.stage.spawn_monster( 13  * this.stage.tilesize , 42  * this.stage.tilesize  , 4 );
		this.stage.spawn_monster( 26  * this.stage.tilesize , 43  * this.stage.tilesize  , 4 );
		this.stage.spawn_monster( 28  * this.stage.tilesize , 42  * this.stage.tilesize  , 4 );
		
		// Guard
		this.stage.spawn_monster( 19  * this.stage.tilesize , 28  * this.stage.tilesize  , 4 );
		this.stage.spawn_monster( 21  * this.stage.tilesize , 28  * this.stage.tilesize  , 4 );
			
			
	}


	//---------------------
	init_dungeon() {
		let i, j ;

		


		for ( i = this.dungeon_area_min.z ; i <= this.dungeon_area_max.z ; i++ ) {
			for ( j = this.dungeon_area_min.x ; j <= this.dungeon_area_max.x ; j++ ) {

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

					this.stage.objectmaps[ j + "," + i ] 	= [ 4 , 0, -1 , wallheight ];
					this.stage.createStaticBox(
			    				j * this.stage.tilesize  ,  
			    				i * this.stage.tilesize  ,  
			    				this.stage.tilesize ,
			    				this.stage.tilesize, 
			    				this.stage.world
			    			);

				}

			}
		}
	}
}