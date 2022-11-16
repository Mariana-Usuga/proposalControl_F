import { Component, Input, OnInit } from '@angular/core';
import { commercialProposal } from 'src/app/models/interfaces/commercialProposal.interfaces';
import { BusinessProposalService } from 'src/app/services/business-proposal.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogAddProposalComponent } from '../dialog-add-proposal/dialog-add-proposal.component';
import { DialogSeeVersionsComponent } from '../dialog-see-versions/dialog-see-versions.component';
import Swal from 'sweetalert2';
import { DialogSeeProposalComponent } from '../dialog-see-proposal/dialog-see-proposal.component';
import { DialogApproveProposalComponent } from '../dialog-approve-proposal/dialog-approve-proposal.component';
import { DialogRejectProposalComponent } from '../dialog-reject-proposal/dialog-reject-proposal.component';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: true
})

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  dis: boolean = true;
  subcription: Subscription | undefined;

  constructor(private businessProposalService: BusinessProposalService,
     public dialog: MatDialog){}

  filtrosObject: commercialProposal= {
    company: null,
    customer: "",
  customerReference: null,
  yearP: null,
  monthP: null,
  servicioConcept: null,
  typeOfService: null,
  currency: null,
  stateP: null,
  baseAmount: null,
  totalAmount: null,
  warranty: null,
  version: null,
  dateVersion: null,
  proposalId: null,
  folder: null
  }

  mayor: commercialProposal = {
    company: null,
    customer: "",
  customerReference: null,
  yearP: null,
  monthP: null,
  servicioConcept: null,
  typeOfService: null,
  currency: null,
  stateP: null,
  baseAmount: null,
  totalAmount: null,
  warranty: null,
  version: null,
  dateVersion: null,
  proposalId: null,
  folder: null
  };

  dataSource: any[] = [];

  ngOnInit(): void {
    this.businessProposalService.getFiltros().subscribe(obj => {
      console.log('obj', obj)
      this.filtrosObject = obj
    })
  }
  //#approve [disabled]="!dis ? true : null"
  /*setDisabled(statep: string){
    if(statep === "aprobado" || statep === "rechazado"){
      console.log('aprobado')
      this.dis = false;
      return false;
     }
  }*/

  state(state: string){
    if(state === "aprobado" || state === "rechazado"){
      console.log('aprobado')
      this.dis = false;
    }
  }

  export(): void{
    console.log('this', this.dataSource)
    this.businessProposalService.exportToExcel(this.dataSource, 'my_export')
  }

buscar(){
  if(this.filtrosObject.customer != ""){
    this.businessProposalService.getBusinessProposal(this.filtrosObject).subscribe(
      (res) => {
        if(res.length === 0){
          console.log('res', res)
          alert('no hay datos que coincidencia con la busqueda')
        }else{
          console.log('res', res)
          this.dataSource = res
          /*let lookupObject: any = {};
          const prop = "idVersionMismaPropuesta"

          for(var a in res) {
             lookupObject[res[a][prop]] = res[a];
          }

          for(a in lookupObject) {
              this.dataSource.push(lookupObject[a]);
          }*/
        }
      },
      (err) => console.log('ha ocurrido un error', err),
      () =>  {
        console.info('se ha completado la llamada')
      }
    )
  }else{
    alert('El campo cliente es obligatorio')
  }
}

editProposal(row: commercialProposal){
  console.log(' this.dataSource', this.dataSource)
  this.dialog.open(DialogAddProposalComponent, {
    width: '70%',
    data:row
  });
}

hostoricalProposal(row: commercialProposal){
  this.dialog.open(DialogSeeVersionsComponent, {
    width: '50%',
    data:row
  });
}

consultProposal(pro: commercialProposal){
  this.dialog.open(DialogSeeProposalComponent, {
    width: '70%',
    data: pro
  });
}

deleteProposal(id: number){
  console.log('entra en delete')
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  })

  swalWithBootstrapButtons.fire({
    title: '¿Estas seguro?',
    text: "Estas seguro de eliminar esta propuesta!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Si, eliminarla!',
    cancelButtonText: 'No, cancelar!',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.subcription = this.businessProposalService.deleteProposal(id).subscribe(
        (v: boolean) => {
        if(v){
          swalWithBootstrapButtons.fire(
            'Eliminada!',
            'La propuesta ha sido eliminada.',
            'success'
          )
        }
      })
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
    }
  })
 }

openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
  this.dialog.open(DialogAddProposalComponent, {
    width: '70%',
    enterAnimationDuration,
    exitAnimationDuration,
  });
}

seeVersions(row: commercialProposal){
  this.dialog.open(DialogSeeVersionsComponent, {
    width: '50%',
    data:row
  });
}

openDialogApprove(row: commercialProposal){
  if(row.stateP != "pendiente"){
    alert('no puedes hacer esta accion')
    document.getElementById("tdApprove")?.classList.add('disabled')
  }else{
    this.dialog.open(DialogApproveProposalComponent, {
      width: '70%',
      data:row
    });
  }
}

openRecha(row: commercialProposal){
  if(row.stateP != "pendiente"){
    alert('no puedes hacer esta accion')
    document.getElementById("tdReject")?.classList.add('disabled')
  }else{
  this.dialog.open(DialogRejectProposalComponent, {
    width: '70%',
    data: row
  });
  }
}
}
