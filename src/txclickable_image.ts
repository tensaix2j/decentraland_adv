

export class Txclickable_image extends UIImage {

	public id;
	public owner ;

	constructor( parent , texture, stage , id , owner ) {


		super( parent , texture );
		this.vAlign = "top";
        this.hAlign = "left";
        this.sourceWidth = 40;
        this.sourceHeight = 40;
        this.width = 40;
        this.height = 40;

        this.id = id;
        this.owner = owner;
        this.positionX = (id % 5) * 40; 
		this.positionY = -((id / 5 ) >> 0 ) * 40; 
		this.visible = true;
		this.onClick = new OnClick(() => {
			stage.inventory_item_onclick( this.id , this.owner );
		})

	}
}