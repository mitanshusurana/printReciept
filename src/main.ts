import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Transaction {
  ledgerName: string;
  transactionType: 'B' | 'S' | 'MI' | 'MR' | 'CG' | 'CR';
  weight: number;
  purity: number;
  netWeight: number;
  rate: number;
  amount: number;
  cash: number;
  balance: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="receipt">
      <form #receiptForm="ngForm" (ngSubmit)="printReceipt()">
        <div class="form-group">
          <label>Ledger Name:</label>
          <input type="text" [(ngModel)]="transaction.ledgerName" name="ledgerName" required>
        </div>

        <div class="form-group">
          <label>Transaction Type:</label>
          <select [(ngModel)]="transaction.transactionType" (ngModelChange)="onTransactionTypeChange()" name="transactionType" required>
            <option value="B">B</option>
            <option value="S">S</option>
            <option value="MI">MI</option>
            <option value="MR">MR</option>
            <option value="CG">CG</option>
            <option value="CR">CR</option>
          </select>
        </div>

        <ng-container *ngIf="!isGoldCashTransaction()">
          <div class="form-group">
            <label>Weight (g):</label>
            <input type="number" [(ngModel)]="transaction.weight" 
                   (ngModelChange)="calculateNetWeight()" name="weight" required 
                   step="0.001" min="0">
          </div>

          <div class="form-group">
            <label>Purity (%):</label>
            <input type="number" [(ngModel)]="transaction.purity" 
                   (ngModelChange)="calculateNetWeight()" name="purity" required
                   step="0.001" min="0" max="100">
          </div>

          <div class="form-group">
            <label>Net Weight (g):</label>
            <input type="text" [value]="formatNumber(transaction.netWeight)" readonly name="netWeight">
          </div>

          <ng-container *ngIf="!isMetalTransaction()">
            <div class="form-group">
              <label>Rate (per g):</label>
              <input type="number" [(ngModel)]="transaction.rate" 
                     (ngModelChange)="calculateAmount()" name="rate" required>
            </div>

            <div class="form-group">
              <label>Amount:</label>
              <input type="text" [value]="roundedAmount" readonly name="amount">
            </div>
          </ng-container>
        </ng-container>

        <ng-container *ngIf="showCashFields()">
          <div class="form-group">
            <label>Cash:</label>
            <input type="number" [(ngModel)]="transaction.cash" 
                   (ngModelChange)="calculateBalance()" name="cash" required>
          </div>

          <div class="form-group" *ngIf="!isGoldCashTransaction() && !isMetalTransaction()">
            <label>Balance:</label>
            <input type="text" [value]="transaction.balance" readonly name="balance">
          </div>
        </ng-container>

        <button type="submit">Print Receipt</button>
      </form>

      <div class="print-only">
        <div class="receipt-copies">
          <!-- First Copy -->
          <div class="receipt-copy">
            <p><strong>LN:</strong> {{transaction.ledgerName}}</p>
            <p><strong>TT:</strong> {{transaction.transactionType}}</p>
            <ng-container *ngIf="!isGoldCashTransaction()">
              <p><strong>W:</strong> {{formatNumber(transaction.weight)}}g</p>
              <p><strong>P:</strong> {{formatNumber(transaction.purity)}}%</p>
              <p><strong>NW:</strong> {{formatNumber(transaction.netWeight)}}g</p>
              <ng-container *ngIf="!isMetalTransaction()">
                <p><strong>R:</strong> {{transaction.rate}}/g</p>
                <p><strong>A:</strong> {{roundedAmount}}</p>
              </ng-container>
            </ng-container>
            <ng-container *ngIf="showCashFields()">
              <p><strong>C:</strong> {{transaction.cash}}</p>
              <p *ngIf="!isGoldCashTransaction() && !isMetalTransaction()"><strong>B:</strong> {{transaction.balance}}</p>
            </ng-container>
            <p><strong>D:</strong> {{formatDate()}}</p>
          </div>

          <!-- Second Copy -->
          <div class="receipt-copy">
            <p><strong>LN:</strong> {{transaction.ledgerName}}</p>
            <p><strong>TT:</strong> {{transaction.transactionType}}</p>
            <ng-container *ngIf="!isGoldCashTransaction()">
              <p><strong>W:</strong> {{formatNumber(transaction.weight)}}g</p>
              <p><strong>P:</strong> {{formatNumber(transaction.purity)}}%</p>
              <p><strong>NW:</strong> {{formatNumber(transaction.netWeight)}}g</p>
              <ng-container *ngIf="!isMetalTransaction()">
                <p><strong>R:</strong> {{transaction.rate}}/g</p>
                <p><strong>A:</strong> {{roundedAmount}}</p>
              </ng-container>
            </ng-container>
            <ng-container *ngIf="showCashFields()">
              <p><strong>C:</strong> {{transaction.cash}}</p>
              <p *ngIf="!isGoldCashTransaction() && !isMetalTransaction()"><strong>B:</strong> {{transaction.balance}}</p>
            </ng-container>
            <p><strong>D:</strong> {{formatDate()}}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .receipt {
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
      padding: 15px;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    }

    .form-group {
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 5px;
      font-weight: bold;
      color: #333;
    }

    input, select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
      font-size: 16px;
    }

    input[readonly] {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    button {
      width: 100%;
      padding: 12px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }

    button:hover {
      background-color: #45a049;
    }

    .print-only {
      display: none;
    }

    @media (min-width: 768px) {
      .form-group {
        flex-direction: row;
        align-items: center;
      }

      label {
        width: 120px;
        margin-bottom: 0;
        margin-right: 10px;
      }

      input, select {
        flex: 1;
      }

      button {
        width: auto;
        min-width: 200px;
        margin-left: 130px;
      }
    }

    /* Print-specific styles */
    @media print {
      @page {
        size: #10 envelope;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
        background: none;
      }

      .receipt {
        margin: 0;
        padding: 0;
        max-width: none;
      }

      form {
        display: none;
      }

      .print-only {
        display: block;
        padding-left: 0.86in;
        padding-top: 0.30in;
      }

      .receipt-copies {
        display: flex;
        gap: 4mm;
      }

      .receipt-copy {
        flex: 1;
        font-size: 9pt;
        line-height: 1.6;
      }

      .receipt-copy p {
        margin: 1.5mm 0;
      }

      strong {
        font-weight: bold;
      }
    }
  `]
})
export class App {
  transaction: Transaction = {
    ledgerName: '',
    transactionType: 'B',
    weight: 0,
    purity: 100,
    netWeight: 0,
    rate: 0,
    amount: 0,
    cash: 0,
    balance: 0
  };

  currentDate = new Date();

  formatNumber(value: number): string {
    return value.toFixed(3);
  }

  get roundedAmount(): string {
    const rounded = Math.round(this.transaction.amount / 10) * 10;
    return rounded.toFixed(0);
  }

  calculateNetWeight() {
    this.transaction.netWeight = Number((this.transaction.weight * this.transaction.purity / 100).toFixed(3));
    if (!this.isMetalTransaction()) {
      this.calculateAmount();
    }
  }

  calculateAmount() {
    this.transaction.amount = this.transaction.netWeight * this.transaction.rate;
    this.calculateBalance();
  }

  calculateBalance() {
    this.transaction.balance = this.transaction.cash - Number(this.roundedAmount);
  }

  formatDate(): string {
    const day = this.currentDate.getDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[this.currentDate.getDay()];
    return `${day.toString().padStart(2, '0')} ${dayName}`;
  }

  isMetalTransaction(): boolean {
    return this.transaction.transactionType === 'MI' || this.transaction.transactionType === 'MR';
  }

  isGoldCashTransaction(): boolean {
    return this.transaction.transactionType === 'CG' || this.transaction.transactionType === 'CR';
  }

  showCashFields(): boolean {
    return !this.isMetalTransaction() || this.isGoldCashTransaction();
  }

  onTransactionTypeChange() {
    if (this.isGoldCashTransaction()) {
      this.transaction.weight = 0;
      this.transaction.purity = 0;
      this.transaction.netWeight = 0;
      this.transaction.rate = 0;
      this.transaction.amount = 0;
      this.transaction.balance = 0;
    } else if (this.isMetalTransaction()) {
      this.transaction.rate = 0;
      this.transaction.amount = 0;
      this.transaction.cash = 0;
      this.transaction.balance = 0;
    }
  }

  printReceipt() {
    window.print();
  }
}

bootstrapApplication(App);