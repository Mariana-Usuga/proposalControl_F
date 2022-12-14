import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BusinessProposalService } from 'src/app/services/business-proposal.service';
import { DialogSeeProposalComponent } from '../dialog-see-proposal/dialog-see-proposal.component';

@Component({
  selector: 'app-dialog-see-versions',
  templateUrl: './dialog-see-versions.component.html',
  styleUrls: ['./dialog-see-versions.component.css']
})
export class DialogSeeVersionsComponent implements OnInit {

  dataSource: any[] = [];
  data: any[] = []
  noMoreVersions: boolean = false;

  constructor(public dialog: MatDialog,  @Inject(MAT_DIALOG_DATA) public proposalSee: any,
  private businessProposalService: BusinessProposalService
  ) { }

  ngOnInit(): void {
    console.log('this.proposalSee.proposalId', this.proposalSee.id)
    if(this.proposalSee.id === undefined){
      this.noMoreVersions = true
      return
    }else{
      this.businessProposalService.getByVersionProposal(this.proposalSee.id).subscribe(
        (res)=>{
          console.log('res in see', res)
          if(res.length === 0){
            this.noMoreVersions = true
            return
          }else{
            for(let le of res){
              const date = le.dateVersion.split('T')
          
              this.dataSource = this.data = res.map((item: any) => {
                if(item.dateVersion){
                  return { ...item, 
                    dateVersion: item.dateVersion.replaceAll('-', '/').split('T')[0] 
                  }
                }
                return item
              })
          }
          }
        },
        (err) => console.log('ha ocurrido un error', err),
            () => console.info('se ha completado la llamada')
      )
    }
  }

  seeProposal(proposal: any){
    console.log('datasour ', this.dataSource)
    console.log('seee proposal ', proposal)
    const data = [
      proposal,
      { versions: true }
    ]
    this.dialog.open(DialogSeeProposalComponent, {
      maxHeight: '100vh',
      data: data
    });
  }

}
