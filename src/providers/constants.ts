
export const pager = (param?:any, posStart?:number) => {
	let page:{page?:number, pageSize?:number} = { page:1, pageSize:20 };
	if(param) {
		Object.assign(page, JSON.parse(JSON.stringify(param)));
	}
	if(posStart) {
		page.page = Math.ceil(posStart/page.pageSize) + 1;
	}
	return page;
}

export const serverVersion = '3.1.5.0';

export const copyright = '2008-2017';

export const version = '2.0.0';

