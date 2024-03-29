import { NgIfContext } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit, Input, Output} from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { commercialProposal } from 'src/app/models/interfaces/commercialProposal.interfaces';
import { BusinessProposalService } from 'src/app/services/business-proposal.service';
import { DataFiltersService } from 'src/app/services/dataFilters/dataFilters.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-add-proposal',
  templateUrl: './dialog-add-proposal.component.html',
  styleUrls: ['./dialog-add-proposal.component.css']
})
export class DialogAddProposalComponent implements OnInit {

  @Input() incomingFilters:any
  @Input() incomingDate:any

  filters: any;
  date: any

  wayToPayDaysNumber: Number = 0;
  totalAmount: Number = 0;
  base: Number = 0;

  action: String = 'Crear';
  showCode: boolean = false
  years = [2022, 2019, 2018, 2017];
  company: Array<String> = []
  customer: Array<String> = []
  customerReference: Array<String> = []
  typeOfService: Array<String> = []
  stateP: Array<String> = []
  currency: Array<String> = ['dolares']

  newProposal!: FormGroup
  newProposalContact!: FormGroup
  idProposalContact: number = 0;
  accionBtn: string = "Guardar"
  shortLink: string = "";
  loading: boolean = false; // Flag variable
  idNewProposal: number = 0;
  files = ""; // Variable to store file
  disabled: boolean = false;
  idProposalCreated: string = ""
  showSlope: any = false;
  followingCode: string = ""

  dates: any = {
    start: '',
    end: '',
  }

  error: any = {
    company: '',
    customer: '',
    typeOfService: '',
    wayToPay: '',
    fullName: '',
    email: ''
  }

  dataSource: any[] = [];
  getCode: any[] = []

  filtrosObject: commercialProposal= {
    code: null,
    company: null,
    customer: "",
    customerReference: null,
    servicioConcept: null,
    typeOfService: null,
    currency: null,
    stateP: null,
    baseAmount: null,
    totalAmount: null,
    version: null,
    dateVersion: null,
    proposalId: null,
    folder: null,
    wayToPay: null,
    wayToPayDays: null,
    creatorUser: null,
  }


  constructor(private formBuilder: FormBuilder,
    private businessProposalService: BusinessProposalService,
    @Inject(MAT_DIALOG_DATA) public getDataArray: any,
    private dialogRef: MatDialogRef<DialogAddProposalComponent>,
    private http: HttpClient, private dataFiltersService: DataFiltersService) { }

    editData: any

  ngOnInit(): void { 
    if(this.getDataArray[0].company){
      this.editData = this.getDataArray[0]
    }

    this.filters = this.incomingFilters
    this.dataFiltersService.getAllCompany().subscribe((res) => {
      this.company = res.data.map((r: any) => r.name)
    })

  this.dataFiltersService.getAllCustomer().subscribe((res) => {
      this.customer = res.data.map((r: any) => r.name)
    })

  this.dataFiltersService.getAllTypeOfService().subscribe((res) => {
    this.typeOfService = res.data.map((r: any) => r.name)
  })

  this.dataFiltersService.getAllState().subscribe((res) => {
    this.stateP = res.data.map((r: any) => r.name)
  })
    let v = null;

    if(this.editData != null){
      v = 1;
    }

    this.newProposal = this.formBuilder.group({
      code: ['', Validators.required],
      company: ['', Validators.required],
      customer: ['', Validators.required],
      customerReference: [''],
      servicioConcept: [''],
      typeOfService: ['', Validators.required],
      currency: [''],
      stateP: ['PENDIENTE'],
      baseAmount: [''],
      totalAmount: [''],
      version: [v, Validators.required],
      dateVersion: [new Date(), Validators.required],
      folder: [''],
      wayToPay: [''],
      wayToPayDays: [''],
      creatorUser: [''],
      editorUser: [''],
      commercialManager: [''],
      presaleManager: [''],
      comments: [''],
      proposalSubmissionDeadline: [''],
      //removerUser : [' ']
    })

    this.newProposalContact = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: [''],
      phoneNumber: [''],
      idProposal: ['']
    })

    if(this.editData){
      this.showCode = true
      this.accionBtn = "Guardar"
      this.action = "Editar"
      this.newProposal.controls['company'].setValue(this.editData.company)
      this.newProposal.controls['customer'].setValue(this.editData.customer)
      this.newProposal.controls['customerReference'].setValue(this.editData.customerReference)
      this.newProposal.controls['servicioConcept'].setValue(this.editData.servicioConcept)
      this.newProposal.controls['typeOfService'].setValue(this.editData.typeOfService)
      this.newProposal.controls['wayToPay'].setValue(this.editData.wayToPay)
      this.newProposal.controls['wayToPayDays'].setValue(this.editData.wayToPayDays)
      this.newProposal.controls['baseAmount'].setValue(this.editData.baseAmount)
      this.newProposal.controls['totalAmount'].setValue(this.editData.totalAmount)
      this.newProposal.controls['currency'].setValue(this.editData.currency)
      this.newProposal.controls['folder'].setValue(this.editData.folder)
      this.newProposal.controls['code'].setValue(this.editData.code)
      this.newProposal.controls['commercialManager'].setValue(this.editData.commercialManager)
      this.newProposal.controls['presaleManager'].setValue(this.editData.presaleManager)
      this.newProposal.controls['proposalSubmissionDeadline'].setValue(this.editData.proposalSubmissionDeadline)
      this.newProposal.controls['comments'].setValue(this.editData.comments)
      this.newProposal.controls['dateVersion'].setValue(this.editData.dateVersion)
      this.newProposal.controls['stateP'].setValue(this.editData.stateP)
      this.getContact()
      this.disabled = true
    }else{
      this.businessProposalService.getFollowingCode().subscribe(
        (res: any) => {
          this.followingCode = res.data
          this.newProposal.controls['code'].setValue(res.data)
              }
      )
      
    }

    if(this.editData.stateP === 'PENDIENTE'){
      this.showSlope = true
    }
  }

  method_page(value: string){
    if(value === "contado"){
      this.newProposal.controls['wayToPayDays'].setValue(this.wayToPayDaysNumber)
    }else{
      this.newProposal.controls['wayToPayDays'].setValue(30)
    }
  }

  calcuteTotalAmount(){
    let tax;
    if(this.newProposal.value.currency === "COP"){
      tax = 0.19
    }else if(this.newProposal.value.currency === "PEN"){
      tax = 0.18
    }else{
      tax = 0.12
    }
    this.totalAmount = (this.newProposal.value.baseAmount * tax) + this.newProposal.value.baseAmount
    this.newProposal.controls['totalAmount'].setValue(this.totalAmount)
  }

  onFileSelect(event: any) {
    this.files = event.target.files;
}

getContact(){
  this.businessProposalService.getContact(this.editData.id).subscribe(
    (res) => {
      this.idProposalContact = res.id
      this.newProposalContact.controls['fullName'].setValue(res.fullName)
      this.newProposalContact.controls['email'].setValue(res.email)
      this.newProposalContact.controls['phoneNumber'].setValue(res.phoneNumber)
    },
    (err) => console.log('ha ocurrido un error', err),
    () => console.info('se ha completado la llamada')
  )
}

  addProposal(){
    if(!this.editData){

      this.showCode = false
    this.action = 'Crear';
    if(this.files.length > 5){
      Swal.fire(
        '',
        'Solo puedes subir maximo 5 archivos!',
        'warning'
      )
    }
    if(this.newProposal.value.company === '' || this.newProposal.value.customer === '' ||
    this.newProposal.value.typeOfService === '' || this.newProposalContact.value.fullName === '' ){
      console.log('primero!!!')
      Swal.fire(
        '',
        'Todos los campos con asterisco son obligatorios!',
        'warning'
      )
      
    }else{
      if(this.newProposal.value.company === ''){
        this.error.company = false
      }
      if(this.newProposal.value.customer === ''){
        this.error.customer = false
      }
      if(this.newProposal.value.typeOfService === ''){
        this.error.typeOfService = false
      }
      if(this.newProposal.value.fullName === ''){
        this.error.fullName = false
      }
  
        const data = {
          code: "",
          company: this.newProposal.value.company,
          customer: this.newProposal.value.customer,
          customerReference: this.newProposal.value.customerReference,
          servicioConcept: this.newProposal.value.servicioConcept,
          typeOfService: this.newProposal.value.typeOfService,
          currency: this.newProposal.value.currency,
          stateP: this.newProposal.value.stateP,
          baseAmount: this.newProposal.value.baseAmount,
          totalAmount: this.newProposal.value.totalAmount,
          wayToPay: this.newProposal.value.wayToPay,
          wayToPayDays: this.newProposal.value.wayToPayDays,
          creatorUser: this.newProposal.value.creatorUser,
          version: 1,
          dateVersion: this.newProposal.value.dateVersion,
          folder: this.newProposal.value.folder,
          editorUser: this.newProposal.value.editorUser,
          removerUser: this.newProposal.value.removerUser,
          proposalSubmissionDeadline: this.newProposal.value.proposalSubmissionDeadline,
          presaleManager: this.newProposal.value.presaleManager,
          commercialManager: this.newProposal.value.commercialManager,
          comments: this.newProposal.value.comments
        }

        this.businessProposalService.addNewProposal(data).subscribe(
          (res) => {
            this.idProposalCreated = res.data.id;
            this.newProposalContact.controls['idProposal'].setValue(res.data.id)
              for (let f of this.files) {

                const file = new FormData();
              file.append("file", f);

              this.businessProposalService.uploadFiles(res.data.id, file).subscribe(
                (res: any) => {
                  this.newProposal.controls['folder'].setValue(res.message)

                }
              )
              }

            if(res.success){
              this.newContact();
              if(this.getDataArray[3]){
                      this.getListProposals() 
                    }
            }
          },
          (err) => console.log('ha ocurrido un error', err),
          () => console.info('se ha completado la llamada')
        )

              this.newProposal.reset()
              this.dialogRef.close('save')
            //}
          }
        }else{
          console.log('entra en update')
          this.updateProposal();
        }
      }

    newContact(){
      this.businessProposalService.addNewProposalContact(this.newProposalContact.value).subscribe(
        (res) => {
          console.log('res contact', res)
         if(res){
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'La propuesta se ha creado',
            showConfirmButton: false,
            timer: 2000
          })
         }
        },
        (err) => console.log('ha ocurrido un error', err),
            () => console.info('se ha completado la llamada')
        )
    }
    
      updateProposal(){
        console.log('update')
       
          const contact = {
            id: this.idProposalContact,
            fullName: this.newProposalContact.value.fullName,
            email:  this.newProposalContact.value.email,
            phoneNumber:  this.newProposalContact.value.phoneNumber,
            idProposal: this.editData.id
          }
          this.businessProposalService.putContact(contact).subscribe(
            (res) => {
              if(res === null){
                console.log('no tiene contacto')
              }
            }
          )
          const data1 = {
            id:  this.editData.id,
            company: this.newProposal.value.company,
            customer: this.newProposal.value.customer,
            customerReference: this.newProposal.value.customerReference,
            servicioConcept: this.newProposal.value.servicioConcept,
            typeOfService: this.newProposal.value.typeOfService,
            currency: this.newProposal.value.currency,
            stateP: this.newProposal.value.stateP,
            baseAmount: this.newProposal.value.baseAmount,
            totalAmount: this.newProposal.value.totalAmount,
            warranty: this.newProposal.value.warranty,
            version: Number(this.editData.version) + 1,
            dateVersion: this.newProposal.value.dateVersion,
            folder: this.newProposal.value.folder,
            wayToPay: this.newProposal.value.wayToPay,
            wayToPayDays: this.newProposal.value.wayToPayDays,
            creatorUser: this.newProposal.value.creatorUser,
            editorUser: this.newProposal.value.editorUser,
            //removerUser: this.newProposal.value.removerUser,
            code: this.newProposal.value.code,
            commercialManager: this.newProposal.value.commercialManager,
            presaleManager: this.newProposal.value.presaleManager,
            proposalSubmissionDeadline: this.newProposal.value.proposalSubmissionDeadline,
            comments: this.newProposal.value.comments
      
          }
          const filter = this.getCode.filter(p => p.code == this.newProposal.value.code)
          if(filter.length == 1){
            Swal.fire(
              '',
              'El codigo ya existe!',
              'warning'
            )
          }
          this.businessProposalService.putProposal(data1).subscribe(
            (res) => {
             
              const data = {
                company: this.editData.company,
                customer: this.editData.customer,
                customerReference: this.editData.customerReference,
                servicioConcept: this.editData.servicioConcept,
                typeOfService: this.editData.typeOfService,
                currency: this.editData.currency,
                stateP: this.editData.stateP,
                baseAmount: this.editData.baseAmount,
                totalAmount: this.editData.totalAmount,
                warranty: this.editData.warranty,
                version: this.editData.version,
                dateVersion: this.editData.dateVersion,
                proposalId: this.editData.id,
                folder: this.editData.folder,
                wayToPay: this.editData.wayToPay,
                wayToPayDays: this.editData.wayToPayDays,
                creatorUser: this.editData.creatorUser,
                editorUser: this.editData.editorUser,
                removerUser: this.editData.removerUser,
                code: this.editData.code,
                commercialManager: this.editData.commercialManager,
                presaleManager: this.editData.presaleManager,
                proposalSubmissionDeadline: this.editData.proposalSubmissionDeadline,
                comments: this.editData.comments
              }
              if(res){
                this.businessProposalService.addNewVersion(data).subscribe(
                  (res) => {
                    console.log('this.getDataArray[3] ', this.getDataArray[3])
                    if(this.getDataArray[3] == true){
                      console.log('ENTRA EN IFFF')
                      this.getListProposals()
                    }
        
                    Swal.fire({
                      position: 'top-end',
                      icon: 'success',
                      title: 'La propuesta se ha editado',
                      showConfirmButton: false,
                      timer: 4000
                    })
                  }
                )
              }
            },
            (err) => console.log('ha ocurrido un error', err),
            () => console.info('se ha completado la llamada')
          )
          this.newProposal.reset()
          this.dialogRef.close('Editar')
        //}
        }
    
        getListProposals(){
          this.businessProposalService.getBusinessProposal(this.getDataArray[1], 
            this.getDataArray[2]).subscribe(
            (resProposals: any) => {
      
              if(resProposals.length === 0){
                //Swal.fire('No hay datos que coincidan con la búsqueda')
              }else{
                console.log('resProposals ',resProposals)
                this.dataSource = resProposals
                this.businessProposalService.addProposals(this.dataSource)
              }
            },
            (err) => console.log('ha ocurrido un error', err),
            () =>  {
              console.info('se ha completado la llamada')
            }
          )
        }




}

