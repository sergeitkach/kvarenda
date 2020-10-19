let Kvarenda = {

	ownCreditRate: 0.08,
	clientAnnuityRate: 0.12,
	saleDiscount: 0.10,
	agencyCommission: 0.025,
	saleTime: 3,
	requiredIncomeRatio: 1,

	guaranteeFeeMonth: 0,
	initialFeeMonth: 0,

	propertyCost: 0,
	clientMonthlyPayment: 0,
	creditTerm: 0,

	constructionTime: 0,
	paymentsNumber: 0,
	totalLost: 0,
	clientRate: 0,
	annuityPayment: 0,
	guaranteeFee: 0,
	rentPayment: 0,
	initialFee: 0,
	annuityWithFee: 0,

	model: {},
	error: null

}

Kvarenda.initKvarenda = function(){

	Kvarenda.guaranteeFeeMonth =  0;
	Kvarenda.initialFeeMonth = 0;

	Kvarenda.propertyCost = 0;
	Kvarenda.clientMonthlyPayment = 0;
	Kvarenda.creditTerm = 0;

	Kvarenda.onstructionTime = 0;
	Kvarenda.paymentsNumber = 0;
	Kvarenda.totalLost = 0;
	Kvarenda.clientRate = 0;
	Kvarenda.annuityPayment = 0;
	Kvarenda.guaranteeFee = 0;
	Kvarenda.rentPayment = 0;
	Kvarenda.initialFee = 0;
	Kvarenda.annuityWithFee = 0;

	Kvarenda.model = {};
	Kvarenda.error = null;

}

Kvarenda.pmt = function(rate, nper, pv, fv=0, type=0){
	return ((-rate)*(pv*Math.pow(1+rate, nper)+fv))/((1+rate*type)*(Math.pow(1+rate,nper)-1));
}

Kvarenda.nper = function(rate, pmt, pv, fv=0, type=0){
	return Math.log((-(fv) * rate + pmt * (1 + rate * type)) / (pv * rate + pmt * (1 + rate * type))) / Math.log(1 + rate);
}

Kvarenda.pv = function(rate, nper, pmt, fv=0, type=0){
	return -fv * Math.pow(1 + rate, -nper) - pmt * (1 + rate * type) * ((1 - Math.pow(1 + rate, -nper)) / rate);
}

Kvarenda.getClientRate = function(){
	return Kvarenda.clientAnnuityRate/12;
}

Kvarenda.getAnnuityPayment = function(){
	return Math.abs(Kvarenda.pmt(Kvarenda.clientRate, Kvarenda.paymentsNumber, Kvarenda.propertyCost));
}

Kvarenda.getAnnuityWithFee = function(){
	return Math.abs(Kvarenda.pmt(Kvarenda.clientRate, Kvarenda.paymentsNumber, Kvarenda.propertyCost - Kvarenda.initialFee));
}

Kvarenda.getPaymentsNumber = function(){
	return Math.round(Kvarenda.nper(Kvarenda.clientRate, -(Kvarenda.clientMonthlyPayment), Kvarenda.propertyCost - Kvarenda.initialFee));
}

Kvarenda.getPropertyCost = function(){
	return Kvarenda.pv(Kvarenda.clientRate, Kvarenda.paymentsNumber, -(Kvarenda.clientMonthlyPayment)) + Kvarenda.initialFee;
}

Kvarenda.getCreditTerm = function(){
	return Kvarenda.paymentsNumber + Kvarenda.guaranteeFeeMonth + Kvarenda.initialFeeMonth;
}

Kvarenda.getTotalLost = function(){
	return Kvarenda.propertyCost*Kvarenda.saleDiscount + Kvarenda.propertyCost*Kvarenda.saleDiscount*Kvarenda.agencyCommission;
}

Kvarenda.getRentPayment = function(){
	return (Kvarenda.clientMonthlyPayment*Kvarenda.creditTerm-Kvarenda.propertyCost)/(Kvarenda.creditTerm-Kvarenda.constructionTime-Kvarenda.guaranteeFeeMonth-Kvarenda.initialFeeMonth);
}

Kvarenda.getGuaranteeFee = function(){
	return Kvarenda.guaranteeFeeMonth*Kvarenda.clientMonthlyPayment;
}

Kvarenda.getInitialFeeMonth = function(){
	return Kvarenda.clientMonthlyPayment==0 ? 0 : Kvarenda.initialFee/Kvarenda.clientMonthlyPayment;
}

Kvarenda.getPmtDate = function(i){

	let now = new Date();

	let year = now.getFullYear()+1;
	let month;

	if (i<=11){
		month = i;
	}else{

		month = (i%12);

		if(month<0){
			month = 0;
		}

		year = year + Math.floor(i/12);

	}

	return new Date(year, month, 1, 0, 0, 0, 0);

}

Kvarenda.initModel = function(date){

	let result	= {
					date: date,
					annuity_debt: Kvarenda.propertyCost,
					diff_debt: Kvarenda.propertyCost - Kvarenda.guaranteeFee - Kvarenda.initialFee,
					pmt_debt: Kvarenda.propertyCost
				};

	return result;

}

Kvarenda.getAnnuityPercents = function(prevDebt){
	return prevDebt * Kvarenda.clientRate;
}

Kvarenda.getAnnuityBody = function(annuity_percents){
	return Kvarenda.annuityPayment - annuity_percents
}

Kvarenda.getAnnuityDebt = function(prevDebt, annuity_body){
	return prevDebt - annuity_body;
}

Kvarenda.getAnnuityPmt = function(annuity_body, annuity_percents){
	return annuity_body + annuity_percents;
}

Kvarenda.getPmtRent = function(i){
	return (i <= Kvarenda.constructionTime ? 0 : Kvarenda.rentPayment) * (i <= Kvarenda.creditTerm - Kvarenda.guaranteeFeeMonth - Kvarenda.initialFeeMonth ? 1 : 0);
}

Kvarenda.getPmtBuyout = function(i, pmt_rent){
	return (Kvarenda.clientMonthlyPayment - pmt_rent) * (i <= Kvarenda.creditTerm - Kvarenda.guaranteeFeeMonth - Kvarenda.initialFeeMonth ? 1 : 0) + (i==1 ? Kvarenda.guaranteeFee + Kvarenda.initialFee : 0);
}

Kvarenda.getPmtDebt = function(prevPmt_debt, pmt_buyout){
	return prevPmt_debt - pmt_buyout;
}

Kvarenda.getPmtTotal = function(pmt_rent, pmt_buyout){
	return pmt_rent + pmt_buyout
}

Kvarenda.getDiffBody = function(firstDiff_debt, prevDiff_debt, pmt_total){
	return (pmt_total==0 ? prevDiff_debt : firstDiff_debt / Kvarenda.paymentsNumber);
}

Kvarenda.getDiffDebt = function(prevDiff_debt, diff_body){
	return prevDiff_debt - diff_body;
}

Kvarenda.getDiffBodySum = function(data){

	let result = 0;

	data.forEach(function(item, i, arr) {
		result = result + item.diff_body;
	});

	return result;

}

Kvarenda.getDiffPercents = function(firstDiff_debt, prevDiff_debt, diff_debt, diffBodySum){
	return (diffBodySum + Kvarenda.propertyCost/Kvarenda.creditTerm >= firstDiff_debt ? 0 : prevDiff_debt*Kvarenda.ownCreditRate/12)*(diff_debt == 0 ? 0 : 1);
}

Kvarenda.getDiffPmt = function(diff_percents, diff_body){
	return diff_percents + diff_body;
}

Kvarenda.getEarlyFeeProfit = function(i, diff_pmt, pmt_total){

	let result = pmt_total - diff_pmt;

	if (i==1){
		result = result - Kvarenda.guaranteeFee - Kvarenda.initialFee;
	}
	return result;

}

Kvarenda.getEarlyFeeProfitSum = function(data){

	let result = 0;

	data.forEach(function(item, i, arr) {
		result = result + (item.earlyFee_profit ? item.earlyFee_profit : 0);
	});

	return result;

}

Kvarenda.getEarlyFeeProfitGrow = function(data, earlyFee_profit){
	return Kvarenda.getEarlyFeeProfitSum(data) + earlyFee_profit;
}

Kvarenda.getBreakdownProfit = function(i, diff_pmt, pmt_total){

	let result = pmt_total - diff_pmt;

	if (i==1){
		result = result - Kvarenda.initialFee - Kvarenda.guaranteeFee;
	}
	return result;

}

Kvarenda.getBreakdownProfitSum = function(data){

	let result = 0;

	data.forEach(function(item, i, arr) {
		result = result + (item.breakdown_profit ? item.breakdown_profit : 0);
	});

	return result;

}

Kvarenda.getBreakdownProfitGrow = function(i, data, breakdown_profit){

	let breakdownProfitSum = Kvarenda.getBreakdownProfitSum(data) + breakdown_profit;
	return breakdownProfitSum * (i > Kvarenda.paymentsNumber ? 0 : 1);
}

Kvarenda.setEarlyFeeAverage = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.earlyFee_average = data[data.length - 1].earlyFee_profitGrow / Kvarenda.paymentsNumber * (item.pmt_total > 0 ? 1 : 0);

	});

}

Kvarenda.setEarlyFeeAverageGrow = function(data){

	let grow = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		grow = grow + item.earlyFee_average;
		item.earlyFee_averageGrow = grow;

	});

}

Kvarenda.setEarlyFeeWaste = function(data){

	let pmtSum = 0;
	let totalSum = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		pmtSum = pmtSum + item.diff_pmt;
		totalSum = totalSum + item.pmt_total;

		let prevIndex = (i-1 >=  0 ? i-1 : 0);
		let prevEarlyFee_waste = (data[prevIndex].earlyFee_waste ? data[prevIndex].earlyFee_waste  : 0);

		item.earlyFee_waste = (item.earlyFee_average == 0 ? prevEarlyFee_waste : totalSum + item.pmt_debt - pmtSum - item.diff_debt - Kvarenda.guaranteeFee - Kvarenda.initialFee);

	});

}

Kvarenda.setEarlyFeeBuyout = function(data){

	let buyoutSum = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		buyoutSum = buyoutSum + item.pmt_buyout;
		item.earlyFee_buyout = buyoutSum * (item.earlyFee_average > 0 ? 1 : 0);

	});

}

Kvarenda.setEarlyFeeFine = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.earlyFee_fine = item.earlyFee_averageGrow - item.earlyFee_waste;

	});

}

Kvarenda.setEarlyFeeFineMax = function(data){

	let fineMax = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		if(item.earlyFee_fine > fineMax){
			fineMax = item.earlyFee_fine;
		}

	});

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}
		if(i==1){
			item.earlyFee_fineMax = fineMax;
		}else{

			let prevIndex = (i-1 >=  0 ? i-1 : 0);
			let prevFine = (data[prevIndex].earlyFee_fine ? data[prevIndex].earlyFee_fine : 0);
			let prevFineMax = (data[prevIndex].earlyFee_fineMax ? data[prevIndex].earlyFee_fineMax : 0);

			item.earlyFee_fineMax = (item.earlyFee_fine > prevFine ? prevFineMax : item.earlyFee_fine);

		}

	});

}

Kvarenda.getYearMax = function(year, data){

	let fineMax = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		if(item.date.getFullYear() == year){

			if(item.earlyFee_fineMax > fineMax){
				fineMax = item.earlyFee_fineMax;
			}

		}

	});

	return fineMax;

}

Kvarenda.setEarlyFeeYearMax = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.earlyFee_yearMax = Kvarenda.getYearMax(item.date.getFullYear(), data);

	});

}

Kvarenda.setEarlyFeeIncome = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.earlyFee_income = item.earlyFee_waste + item.earlyFee_yearMax;

	});

}

Kvarenda.setEarlyFeeNorm = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.earlyFee_norm = (item.earlyFee_income - item.earlyFee_averageGrow) / item.earlyFee_averageGrow;

	});

}

Kvarenda.setBreakdownAaverage = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_average = data[data.length - 1].breakdown_profitGrow / Kvarenda.paymentsNumber * (item.pmt_total > 0 ? 1 : 0);

	});

}

Kvarenda.setBreakdownAverageGrow = function(data){

	let grow = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		grow = grow + item.breakdown_average;
		item.breakdown_averageGrow = grow*(item.breakdown_average > 0 ? 1 : 0);

	});

}

Kvarenda.setBreakdownPaid = function(data){

	let pmtSum = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		pmtSum = pmtSum + item.diff_pmt;

		item.breakdown_paid = (pmtSum + item.diff_debt + Kvarenda.guaranteeFee + Kvarenda.initialFee) * (item.breakdown_averageGrow > 0 ? 1 : 0);

	});

}

Kvarenda.setBreakdownReceived = function(data){

	let totalSum = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		totalSum = totalSum + item.pmt_total;

		item.breakdown_received = (totalSum + Kvarenda.propertyCost - Kvarenda.totalLost)*(item.breakdown_average == 0? 0 : 1);

	});

}

Kvarenda.setBreakdownWaste = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_waste = item.breakdown_received - item.breakdown_paid;

	});

}

Kvarenda.setBreakdownNeed = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_need = i * item.breakdown_average * Kvarenda.requiredIncomeRatio;

	});

}

Kvarenda.setBreakdownOver = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_over = item.breakdown_waste - item.breakdown_need;

	});

}

Kvarenda.setBreakdownBuyout = function(data){

	let buyoutSum = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		buyoutSum = buyoutSum + item.pmt_buyout;
		item.breakdown_buyout = buyoutSum * (item.breakdown_averageGrow > 0 ? 1 : 0);

	});

}

Kvarenda.setBreakdownReturn = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_return = (item.breakdown_over >= item.breakdown_buyout ? item.breakdown_buyout : item.breakdown_over)*( item.breakdown_over <= 0 ? 0 : 1);

	});

}

Kvarenda.setBreakdownFine = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_fine = item.breakdown_buyout - item.breakdown_return;

	});

}

Kvarenda.setBreakdownFineMax = function(data){

	let fineMax = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		if(item.breakdown_fine > fineMax){
			fineMax = item.breakdown_fine;
		}

	});

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}
		if(i==1){
			item.breakdown_fineMax = fineMax;
		}else{

			let prevIndex = (i-1 >=  0 ? i-1 : 0);
			let prevFine = (data[prevIndex].breakdown_fine ? data[prevIndex].breakdown_fine : 0);
			let prevFineMax = (data[prevIndex].breakdown_fineMax ? data[prevIndex].breakdown_fineMax : 0);

			item.breakdown_fineMax = (item.breakdown_fine > prevFine ? prevFineMax : item.breakdown_fine);

		}

	});

}

Kvarenda.setBreakdownFineBuyout = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_fineBuyout = (item.breakdown_fineMax >= item.breakdown_buyout ? item.breakdown_buyout : item.breakdown_fineMax);

	});

}

Kvarenda.setBreakdownFineBuyoutPercents = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_fineBuyoutPercents = (item.breakdown_buyout != 0 ? item.breakdown_fineBuyout / item.breakdown_buyout : 0);

	});

}

Kvarenda.getFineBuyoutPercentsMax = function(year, data){

	let fineMax = 0;

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		if(item.date.getFullYear() == year){

			if(item.breakdown_fineBuyoutPercents > fineMax){
				fineMax = item.breakdown_fineBuyoutPercents;
			}

		}

	});

	return fineMax;

}

Kvarenda.setBreakdownFineMaxPercents = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_fineMaxPercents = Kvarenda.getFineBuyoutPercentsMax(item.date.getFullYear(), data) * (i >= Kvarenda.paymentsNumber ? 0 : 1);

	});

}

Kvarenda.setBreakdownFineMaxYear = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_fineMaxYear = item.breakdown_fineMaxPercents * item.breakdown_buyout;

	});

}

Kvarenda.setBreakdownTotalIncome = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_totalIncome = (item.breakdown_waste - (item.breakdown_buyout - item.breakdown_fineMaxYear)) * (i >= Kvarenda.paymentsNumber ? 0 : 1);

	});

}

Kvarenda.setBreakdownTotalIncomePercents = function(data){

	data.forEach(function(item, i, arr) {

		if(i==0){
			return;
		}

		item.breakdown_totalIncomePercents = (i >= Kvarenda.paymentsNumber ? 0 : (item.breakdown_totalIncome - item.breakdown_need) / item.breakdown_need);

	});

}

Kvarenda.getModel = function(){

	let result = [];

	for (let i = 0; i <= Kvarenda.paymentsNumber; i++) {

		let data = {
			date: Kvarenda.getPmtDate(i)
		};

		if (i==0){

			result.push(Kvarenda.initModel(data.date));
			continue;

		}

		let prevAnnuity_debt = result[i-1].annuity_debt;

		data.annuity_percents = Kvarenda.getAnnuityPercents(prevAnnuity_debt);
		data.annuity_body = Kvarenda.getAnnuityBody(data.annuity_percents);
		data.annuity_debt = Kvarenda.getAnnuityDebt(prevAnnuity_debt, data.annuity_body);
		data.annuity_pmt = Kvarenda.getAnnuityPmt(data.annuity_body, data.annuity_percents);

		let prevPmt_debt = result[i-1].pmt_debt;

		data.pmt_rent = Kvarenda.getPmtRent(i);
		data.pmt_buyout = Kvarenda.getPmtBuyout(i, data.pmt_rent);
		data.pmt_debt = Kvarenda.getPmtDebt(prevPmt_debt, data.pmt_buyout);
		data.pmt_total = Kvarenda.getPmtTotal(data.pmt_rent, data.pmt_buyout);

		let firstDiff_debt = result[0].diff_debt;
		let prevDiff_debt = result[i-1].diff_debt;

		data.diff_body = Kvarenda.getDiffBody(firstDiff_debt, prevDiff_debt, data.pmt_total);
		data.diff_debt = Kvarenda.getDiffDebt(prevDiff_debt, data.diff_body);
		data.diff_percents = Kvarenda.getDiffPercents(firstDiff_debt, prevDiff_debt, data.diff_debt, Kvarenda.getDiffBodySum(result));
		data.diff_pmt = Kvarenda.getDiffPmt(data.diff_percents, data.diff_body);

		data.earlyFee_profit = Kvarenda.getEarlyFeeProfit(i, data.diff_pmt, data.pmt_total);
		data.earlyFee_profitGrow = Kvarenda.getEarlyFeeProfitGrow(result, data.earlyFee_profit);

		data.breakdown_profit = Kvarenda.getBreakdownProfit(i, data.diff_pmt, data.pmt_total);
		data.breakdown_profitGrow = Kvarenda.getBreakdownProfitGrow(i, result, data.breakdown_profit);

		result.push(data);

		Kvarenda.setEarlyFeeAverage(result);
		Kvarenda.setEarlyFeeAverageGrow(result);
		Kvarenda.setEarlyFeeWaste(result);
		Kvarenda.setEarlyFeeBuyout(result);
		Kvarenda.setEarlyFeeFine(result);
		Kvarenda.setEarlyFeeFineMax(result);
		Kvarenda.setEarlyFeeYearMax(result);
		Kvarenda.setEarlyFeeIncome(result);
		Kvarenda.setEarlyFeeNorm(result);

		Kvarenda.setBreakdownAaverage(result);
		Kvarenda.setBreakdownAverageGrow(result);
		Kvarenda.setBreakdownPaid(result);
		Kvarenda.setBreakdownReceived(result);
		Kvarenda.setBreakdownWaste(result);
		Kvarenda.setBreakdownNeed(result);
		Kvarenda.setBreakdownOver(result);
		Kvarenda.setBreakdownBuyout(result);
		Kvarenda.setBreakdownReturn(result);
		Kvarenda.setBreakdownFine(result);
		Kvarenda.setBreakdownFineMax(result);
		Kvarenda.setBreakdownFineMax(result);
		Kvarenda.setBreakdownFineBuyout(result);
		Kvarenda.setBreakdownFineBuyoutPercents(result);
		Kvarenda.setBreakdownFineMaxPercents(result);
		Kvarenda.setBreakdownFineMaxYear(result);
		Kvarenda.setBreakdownTotalIncome(result);
		Kvarenda.setBreakdownTotalIncomePercents(result);

	}

	return result;

}

Kvarenda.getPreResult = function(propertyCost=0, clientMonthlyPayment=0, paymentsNumber=0, initialFee=0, constructionTime=0){

	Kvarenda.propertyCost = propertyCost;
	Kvarenda.clientMonthlyPayment = clientMonthlyPayment;
	Kvarenda.paymentsNumber = paymentsNumber;
	Kvarenda.initialFee = initialFee;
	Kvarenda.constructionTime = constructionTime;

	Kvarenda.clientRate = Kvarenda.getClientRate();
	
	if (Kvarenda.propertyCost != 0 && Kvarenda.paymentsNumber !=0){

		Kvarenda.annuityPayment = Kvarenda.getAnnuityPayment();
		Kvarenda.annuityWithFee = Kvarenda.getAnnuityWithFee();
		Kvarenda.clientMonthlyPayment = Kvarenda.annuityWithFee;

	}else if(Kvarenda.propertyCost != 0 && Kvarenda.clientMonthlyPayment != 0){

		Kvarenda.paymentsNumber = Kvarenda.getPaymentsNumber();
		Kvarenda.annuityPayment = Kvarenda.getAnnuityPayment();
		Kvarenda.annuityWithFee = Kvarenda.getAnnuityWithFee();
		Kvarenda.clientMonthlyPayment = Kvarenda.annuityWithFee;

	}else if(Kvarenda.clientMonthlyPayment !=0 && Kvarenda.paymentsNumber !=0){

		Kvarenda.propertyCost = Kvarenda.getPropertyCost();
		Kvarenda.annuityPayment = Kvarenda.getAnnuityPayment();
		Kvarenda.annuityWithFee = Kvarenda.getAnnuityWithFee();
		Kvarenda.clientMonthlyPayment = Kvarenda.annuityWithFee;		

	}

	Kvarenda.totalLost = Kvarenda.getTotalLost();

	Kvarenda.guaranteeFee = Kvarenda.getGuaranteeFee();
	Kvarenda.initialFeeMonth = Kvarenda.getInitialFeeMonth();
	Kvarenda.creditTerm = Kvarenda.getCreditTerm();
	Kvarenda.rentPayment = Kvarenda.getRentPayment();

	Kvarenda.model = Kvarenda.getModel();

}

Kvarenda.calc = function(propertyCost=0, clientMonthlyPayment=0, paymentsNumber=0, initialFee=0, constructionTime=0){

	if((propertyCost==0 && clientMonthlyPayment==0 && paymentsNumber==0)||
		(propertyCost==0 && clientMonthlyPayment==0)||
		(propertyCost==0 && paymentsNumber==0)||
		(clientMonthlyPayment==0 && paymentsNumber==0)){

		Kvarenda.error = 'RequiredParametersError';
		return Kvarenda;

	}

	Kvarenda.initKvarenda();

	if (clientMonthlyPayment!=0 && clientMonthlyPayment <= (propertyCost - initialFee) * Kvarenda.getClientRate()){
		Kvarenda.error = 'EconomicError';
		return Kvarenda;
	}

	while (true) {

		Kvarenda.getPreResult(propertyCost, clientMonthlyPayment, paymentsNumber, initialFee, constructionTime);

		if(Kvarenda.model.length >= 2 && Kvarenda.model[1].breakdown_totalIncomePercents > 0){
			break;
		}

		Kvarenda.guaranteeFeeMonth = Kvarenda.guaranteeFeeMonth + 1;

	}

	return Kvarenda;

}