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
          <select [(ngModel)]="transaction.transactionType" name="transactionType" required>
            <option value="B">B</option>
            <option value="S">S</option>
             <option value="MI">MI</option>
            <option value="MR">MR</option>
             <option value="CG">CG</option>
            <option value="CR">CR</option>
          </select>
        </div>

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

        <div class="form-group">
          <label>Rate (per g):</label>
          <input type="number" [(ngModel)]="transaction.rate" 
                 (ngModelChange)="calculateAmount()" name="rate" required>
        </div>

        <div class="form-group">
          <label>Amount:</label>
          <input type="text" [value]="roundedAmount" readonly name="amount">
        </div>

        <div class="form-group">
          <label>Cash:</label>
          <input type="number" [(ngModel)]="transaction.cash" 
                 (ngModelChange)="calculateBalance()" name="cash" required>
        </div>

        <div class="form-group">
          <label>Balance:</label>
          <input type="text" [value]="transaction.balance" readonly name="balance">
        </div>

        <button type="submit">Print Receipt</button>
      </form>

      <div *ngIf="showReceipt" class="print-receipt">
        <div class="receipt-copies">
          <!-- First Copy -->
          <div class="receipt-copy">
            <div class="receipt-content">
              <p><strong>LN:</strong> {{transaction.ledgerName}}</p>
              <p><strong>TT:</strong> {{transaction.transactionType}}</p>
              <p><strong>W:</strong> {{formatNumber(transaction.weight)}}g</p>
              <p><strong>P:</strong> {{formatNumber(transaction.purity)}}%</p>
              <p><strong>NW:</strong> {{formatNumber(transaction.netWeight)}}g</p>
              <p><strong>R:</strong> {{transaction.rate}}/g</p>
              <p><strong>A:</strong> {{roundedAmount}}</p>
              <p><strong>C:</strong> {{transaction.cash}}</p>
              <p><strong>B:</strong> {{transaction.balance}}</p>
              <p><strong>D:</strong> {{formatDate()}}</p>
            </div>
          </div>

          <!-- Second Copy -->
          <div class="receipt-copy">
           <div class="receipt-content">
              <p><strong>LN:</strong> {{transaction.ledgerName}}</p>
              <p><strong>TT:</strong> {{transaction.transactionType}}</p>
              <p><strong>W:</strong> {{formatNumber(transaction.weight)}}g</p>
              <p><strong>P:</strong> {{formatNumber(transaction.purity)}}%</p>
              <p><strong>NW:</strong> {{formatNumber(transaction.netWeight)}}g</p>
              <p><strong>R:</strong> {{transaction.rate}}/g</p>
              <p><strong>A:</strong> {{roundedAmount}}</p>
              <p><strong>C:</strong> {{transaction.cash}}</p>
              <p><strong>B:</strong> {{transaction.balance}}</p>
              <p><strong>D:</strong> {{formatDate()}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .receipt {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: inline-block;
      width: 120px;
      margin-right: 10px;
    }

    input, select {
      padding: 5px;
      width: 200px;
    }

    input[readonly] {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    button {
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
    }

    button:hover {
      background-color: #45a049;
    }

    .print-receipt {
      margin-top: 30px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .receipt-content {
      line-height: 1.6;
    }

    /* Print-specific styles */
    @media print {
      @page {
        size: A6 landscape;
        margin: 5mm;
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

      form, button {
        display: none;
      }

      .print-receipt {
        border: none;
        padding: 0;
        margin: 0;
        page-break-inside: avoid;
      }

      .receipt-copies {
        display: flex;
      }

      .receipt-copy {
        flex: 1;
      }

      .receipt-copy:first-child {
        margin-right: 2mm;
      }

      .receipt-copy:last-child {
        margin-left: 2mm;
      }

      h3 {
        margin: 0 0 3mm 0;
        font-size: 12pt;
        text-align: center;
        border-bottom: 1px solid #000;
        padding-bottom: 2mm;
      }

      .receipt-content {
        font-size: 10pt;
      }

      .receipt-content p {
        margin: 2mm 0;
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

  showReceipt = false;
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
    this.calculateAmount();
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

  printReceipt() {
    this.showReceipt = true;
    setTimeout(() => {
      window.print();
    }, 100);
  }
}

bootstrapApplication(App);