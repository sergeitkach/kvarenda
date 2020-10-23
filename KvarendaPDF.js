function getCustomerTablePDF(header='', subheader='', text='', paramsData, tableData){

	let docDefinition = {
		content: [
			{text: header, style: 'header'},
			{text: subheader, style: 'subheader'},
			text,
			{
				style: 'table',
				table: {
					body: paramsData
				}
			},
			{
				style: 'table',
				table: {
					body: tableData
				},
				layout: {
					fillColor: function (rowIndex, node, columnIndex) {
						return (rowIndex % 2 === 0 && rowIndex != 0) ? '#CCCCCC' : null;
					}
				}
			}
		],
		styles: {
			header: {
				fontSize: 18,
				bold: true,
				margin: [0, 0, 0, 10]
			},
			subheader: {
				fontSize: 16,
				bold: true,
				margin: [0, 10, 0, 5]
			},
			table: {
				margin: [0, 15, 0, 15],
				fontSize: 6,
				alignment: 'right'
			},
			tableHeader: {
				bold: true,
				fontSize: 7,
				color: 'black',
				alignment: 'center'
			}
		}
	}

	pdfMake.createPdf(docDefinition).download('Kvarenda');

}