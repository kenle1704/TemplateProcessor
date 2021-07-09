var contentBuilder = function( dataArr,disable_tag,callback )
{
	var self = this;
	this.evalPermission = function( perStr )
	{
		var allow = false;
		if( typeof( perStr ) == "string" )
		{
			var permissions=perStr.trim().split( /\s+/ );
			for(var i=0; i<permissions.length; i++ )
			{
				var permission=permissions[i];
				if( !(global_widgets.indexOf( permission ) != -1  && access_widgets.indexOf( permission ) == -1 ) ) allow = true;
			}
		}
		return allow;
	}
	this.replace_cool = function( str, node, prefix, replaceUndef, replaceSpec )
	{
		var regex = /{{([^{}]+)}}/g;
		var replaceSomething = function( match )
		{
			if (typeof( node ) == "undefined") return match;
			var arr = match.replace( '{{', '' ).replace( '}}', '' ).replace( prefix, '' ).split('|');
			var filter = (arr.length > 1) ? arr[1] : '';
			var key = arr[0];
			var a  = key.split( '.' );
			var pre = a.shift();
			var b = '';
			if( pre != '' && typeof( node[pre] ) == 'undefined' ) return match;
			var val = node;
			if (pre != '') {
				val = node[pre];
			}
			for( var i in a )
			{
        val = val[a[i]];
				if(typeof ( val ) == 'undefined' ) {
					if (!replaceUndef) return match;
					else break;
        }
			}
			if( typeof( val ) == "undefined" || val == null) return '';
			else
			{
				if (filter === 'no_filter') return htmlEntitiesDecode(val);
				else if ( filter === 'pure') return val;
				else return htmlEntities(val);
			}
		}
		if( str ) str = str.replace( regex, replaceSomething );
		return str;
	}
	this.get_tag=function(html,no_tag){
                        if(html){
                        var a  = html.split('[[');
                        var pre = a.shift();
                        if ( a.length > 0  && (!disable_tag || typeof(disable_tag)=="undefined")) {

                                if(!no_tag){
                                var html_ = '[[' + a.join('[[');
                                var tagRegexP=/(\[\[\s*(loop|literal|if|section|value|assign).*?\]\])/;
                                //var tagRegexP_=/(\[\[\s*(assign).*?\]\])/;
                                //var match_ = tagRegexP_.exec(html_);
                                //if ( match_ != null ) return 'assign';
                                var match = tagRegexP.exec(html_);
                                if ( match != null ) {

                                        return {
                                                'tag': match[2],
                                                'pre': pre,
                                                'html': html,
						'post': html_

                                        }


                                } else {


                                        return {

                                        'tag': null,
                                                'pre': '',
                                                'html': html,
						'post': html 


                                        }

                                 }

                               }else{
                                        return {

                                        'tag': null,
                                                'pre': '',
                                                'html': html,
						'post':html


                                        }


                                }
                        }else {

                                        return {

                                        'tag': null,
                                                'pre': '',
                                                'html': html,
						'post':html 


                                        }
                        }

                        }
                        return null;
                }


	this.buildContent=function(myString){
		myString=self.replace_cool( myString, dataArr, '', undefined ,true);
		var tag=self.get_tag(myString);
		return self.constructContent(myString,tag,true);
	}
	this.constructContent = function( myString, tag,mainloop)
                {
			if(dataArr && tag){
				if ( tag.tag == 'if' ) {
                                myString = self.constructIf(tag.html,tag);
				
                        	} else if ( tag.tag == 'loop' ) {
                                myString = self.constructLoop(tag.html,tag);
                        	} else if ( tag.tag == 'literal' ) {
                                myString = self.constructLiteral(tag.html,tag);
                        	} else if ( tag.tag == 'section' ) {
                                myString = self.constructSection(tag.html,tag);
                        	} else if ( tag.tag == 'value' ){
                                myString = self.constructValue(tag.html,tag);

                        	} else if (  tag.tag == 'assign'){
                                myString = self.constructAssign(tag.html,tag);

	                        }

			}
			myString=self.replace_cool( myString, dataArr, '', undefined ,true);
			tag=self.get_tag(myString);
                        if ( tag && tag.tag != null ) {
				//if(!callback || !mainloop)		return self.constructContent(myString,tag,mainloop);
				//else {
				//	setTimeout(function(){

				return	self.constructContent(myString,tag,mainloop);
				//},5);


				//}
                        } else {
				if(!callback || !mainloop) return myString;
				else {
					callback(myString);	
				}
                        }


                }

		this.constructIf=function(html,tag){
		       var queue = [];
                        var temp ={};
                        var count = 0;
                        do {
                                if ( tag.post.length > 0 ) {
                                        var html_ = tag.post;
                                        var contentRegexp = /(((.|\r|\n)*?)(\[\[\s*(\/if|if).*?\]\]))((.|\r|\n)*)/;
                                        var match = contentRegexp.exec(html_);
        				if (  match != null ) {
	                               var pre_ = match[2];
					var start = match[4];
                                        var phase = match[5];
                                        var post = match[6];
                                        if ( phase == '/if' && queue.length > 0) {
						
                                                var content = queue.pop() + tag.pre + pre_ + start;
						if ( queue.length == 1 ) {
							var cmd5 = randomString(32);
							temp[cmd5] = content;
							post = '{{'+cmd5+'|pure}}' + post;
						} else if ( queue.length > 1 ) {
							var b = queue.pop();		
							queue.push(b+content);
			
						} else {
							tag=self.get_tag(content);
                                                        var html_ = self.IfFiltering(content,tag);
							html_ = self.replace_cool( html_, temp, '', undefined );
							post = html_ + post;
						}
                                        }
                                        else if ( phase == 'if' ) {
						if ( queue.length > 0 ) {
							var a = queue.pop();		
							queue.push(a+tag.pre+pre_);
							queue.push(start);
						}else {
                                                	queue.push(tag.pre+pre_+start);
						}
                                        }
                                        else alert ("encounter error");
                                        html = post;
					tag=self.get_tag(html);
					}
					else  {
						alert ( "syntax error in " + html_ );
					}
                                }
                        } while ( queue.length > 0 )
			return html;
                }
		this.get_if_statement=function(statement){
			var objs = statement.match(/{{([^{}]+)}}/g);
			if ( objs != null ) {
				for ( var i = 0; i < objs.length; i ++ ){
					var obj = objs[i].match(/{{(.*)*\.(.*?)}}/);
					if ( obj != null && typeof(obj[1]) != 'undefined' ){
						var item = eval("dataArr."+obj[1]);
						statement = self.replace_cool( statement, item, obj[1], undefined, true );
					}
				}
			}
			var objs_ = statement.match(/((.|\r|\n)*?)(<(\s*.*\s*)>)((.|\r|\n)*)/);
			if ( objs_ != null ) {
				statement = self.evalPermission(objs_[4]);
				if ( objs_[1] ) statement = objs_[1] + "  " + statement;
				if ( objs_[5] ) statement =  statement + objs_[5]; 
			}
			return statement;
		}
		this.IfFiltering=function(html_,tag){
                        var html = '';
                        if( tag.tag != "if" ) return html_;
                        var post = '';
                        if ( tag.post.length > 0 ) {
                                var html__ =tag.post;
                                var contentRegexp=/(((.|\r|\n)*?)\[\[\s*if\s*(.*?)\s*\]\])((.|\r|\n)*)(\[\[\s*\/\s*if\s*\]\])((.|\r|\n)*)/;
                                var match1=contentRegexp.exec(html__);
                                if ( match1 != null ) {
				var pre__ = match1[2];
                                var content = match1[5];
                                var statement = self.get_if_statement ( match1[4] );
                                var end = match1[7]
                                post = match1[8];
                                do{
                                        var a_  = content.split('[[');
                                        var pre_ = a_.shift();
                                        if ( a_.length > 0 ) {
                                                content = '[[' + a_.join('[[');
                                                var elseRegexp=/((.|\r|\n)*?)\[\[\s*(elseif\s*(.*?)|else)\s*\]\]((.|\r|\n)*)/;

                                                var match3 = elseRegexp.exec(content);
                                                if ( match3 == null ) {
                                                        if ( eval(statement) )
														{
															html += pre_ + content ;
														}
														content = null;
                                                }
                                                else {
                                                                if (  typeof (match3[5] ) != 'undefined' ) content = match3[5];
							     if ( eval(statement) ) {
                                                                html += pre_ + match3[1];
                                                                content = null;
                                                        }
                                                        else if ( typeof(match3[4])!='undefined') {
                                                                statement = self.get_if_statement(match3[4]);
                                                        }
                                                        else {
                                                                html+=match3[5];
                                                                content = null;
                                                        }
                                                }
					 } else {
						if (  eval(statement) ){
							html+=content;
						}
						content = null;
		
					}
                                        
                                }while(content);
				html = pre__ + html;
				} else {
					alert ( "syntax error in " + html_ );
				}
                        }
                        return tag.pre+ html + post;
                }

		this.constructLoop=function(myString,tag){
                        var queue = [];

                        do {
                                if ( tag.post.length > 0 ) {
                                myString = tag.post;
                                        var contentRegexp = /((.|\r|\n)*?\[\[\s*(\/loop|loop).*?\]\])((.|\n|\r)*)/;
                                        var match = contentRegexp.exec(myString);
                                        var start = match[1];
                                        var phase = match[3];
                                        var post = match[4];
                                        if ( phase == '/loop' && queue.length > 0) {
                                                var content = queue.pop() + tag.pre + start;
                                                if ( queue.length >= 1 ) {
                                                        var content_ = queue.pop() + content;
                                                        queue.push(content_);
                                                }
                                                else {
                                                        var html_ = self.loopFiltering(content,self.get_tag(content));
                                                        post = html_ + post;
                                                }
                                        }
                                        else if ( phase == 'loop' ) queue.push(tag.pre + start);
                                        else alert ("encounter error");
                                        myString = post;
					tag=self.get_tag(myString);
                                } else {
					queue.length = 0;
					alert ("Syntax error in " + myString);
	
				}
                        } while ( queue.length > 0 )

                        return myString;
                }

		 this.loopFiltering=function(myString,tag){


                        var html = '';
                        if ( tag.tag != "loop" ) return myString;
                        var post = '';
			if ( tag.post.length > 0 ) {
                                myString = tag.post;
                                var myRegexp = /(((.|\n|\r)*?)\[\[\s*loop(\s+variable\s*=\s*([A-Za-z\d_\.]*)\s+item\s*=\s*([A-Za-z\d_\.]*))*\s*\]\])((.|\n|\r)*(\[\[\s*loop.*\s*\]\](.|\n|\r)*\[\[\s*\/\s*loop\s*\]\](.|\n|\r)*)*)(\[\[\s*\/\s*loop\s*\]\])((.|\n|\r)*)/;

                                var match = myRegexp.exec(myString);

        			if ( match != null ) { 
	                       var pre_=match[2];
                                var content=match[7];
                                var end=match[12];
                                post=match[13];
                                var html_ = '';
				var variable = match[5];
				var c = variable.split('.');
				var d = "dataArr";
				for ( var i in c ) {
                                        d += '[\'' + c[i] + '\']' ;
                                        if ( typeof ( eval(d  ) ) == 'undefined' ) alert ( "object "+  d+ " is not exist");
                                }
				var b =  eval(d);
                                for (var i in b ) {

                                        var item = b[i];
					if ( typeof(item) == 'object') {
                                        	var html__ = self.replace_cool( content, item, match[6], undefined ,true);
						if ( self.get_tag(html__).tag != 'value' ){ 
                                       	 		html_ += self.constructContent(html__);
						} else {
							html_ += html__
						}
					}
                                }
                         	       html = pre_ + html_;
				} else {

					 var myRegexp_ = /(((.|\n|\r)*?)\[\[\s*loop(\s+variable\s*=\s*([A-Za-z\d_\.]*)\s+item\s*=\s*([A-Za-z\d_\.]*)\s+key\s*=\s*([A-Za-z\d_\.]*))*\s*\]\])((.|\n|\r)*(\[\[\s*loop.*\s*\]\](.|\n|\r)*\[\[\s*\/\s*loop\s*\]\](.|\n|\r)*)*)(\[\[\s*\/\s*loop\s*\]\])((.|\n|\r)*)/;

                                var match_ = myRegexp_.exec(myString);

					if ( match_ != null ) {
					var pre_=match_[2];
	                                var content=match_[8];
	                                var end=match_[13];
					var variable = match_[5];
					var prefix = match_[6];
					var key = match_[7];
	                                post=match_[14];
	                                var html_ = '';
	                                var b =  dataArr[variable];
	                                for (var i in b ) {
	
                                	        var item = b[i];
						item[key] = i;
						var html__ = '';
                                	        html__ = self.replace_cool( content, item, prefix, undefined ,true);
						if ( self.get_tag(html__).tag != 'value' ){
                                	                html_ += self.constructContent(html__);
                                	        } else {
                                	                html_ += html__
                                	        }
                                	}
                                       html = pre_ + html_;
			

	
					}	 else {
					alert ( "syntax error in " + myString );
					}
				}
                        }

                        return tag.pre + html + post;

                }

		this.constructLiteral=function(myString,tag){
			if ( tag.tag != 'literal' ) return myString;

			var queue = [];

			do {
				var contentRegexp = /((.|\r|\n)*?\[\[\s*(\/literal|literal).*?\]\])((.|\r|\n)*)/;
				var match = contentRegexp.exec(myString);
				var pre = match[1];
				var phase = match[3];
				var post = match[4];	
				if ( phase == '/literal' && queue.length > 0 ) {
					var content = queue.pop() + pre;
					var html_ = self.literalFiltering(content,self.get_tag(content));
					post = html_ + post;
			
				}
				else if ( phase == 'literal' ) queue.push(pre);
				else alert ("encounter error");
				myString = post;
			} while ( queue.length > 0 ) 

			return myString;
		}
		this.literalFiltering=function(myString,tag){
		
		
			var html = '';
			if ( tag.tag != 'literal' ) return myString;
			var myRegexp = /((.|\r|\n)*?)(\[\[\s*literal(\s+variable\s*=\s*(\w+)\s+item\s*=\s*(\w+))*\s*\]\])((.|\r|\n)*)(\[\[\s*\/\s*literal\s*\]\])((.|\r|\n)*)/;
		
		
				var match = myRegexp.exec(myString);
			if ( match != null ) {
			var pre="";
			var start=match[3];
			var pre=match[1];
			var content=match[7]; 
			var end=match[9];
			var post=match[10];
			var item = dataArr[match[5]];
                        content = self.replace_cool( content, item, match[6], undefined ,true);					
			html = content;
			
			return pre + html + post;
			} else {
				alert ( "syntax error in " + myString );
				return;
			}
	
		}
		this.constructSection=function(myString,tag){
                        var queue = [];
                        do {
                                if ( tag.post.length > 0 ) {
                                myString = tag.post;
                                        var contentRegexp = /((.|\r|\n)*?\[\[\s*(\/section|section).*?\]\])((.|\r|\n)*)/;
                                        var match = contentRegexp.exec(myString);
                                        var start = match[1];
                                        var phase = match[3];
                                        var post = match[4];
                                        if ( phase == '/section' && queue.length > 0) {
                                                var content = queue.pop() + tag.pre + start;
                                                if ( queue.length >= 1 ) {
                                                        var content_ = queue.pop() + content;
                                                        queue.push(content_);
                                                }
                                                else {
                                                        var html_ = self.sectionFiltering(content,self.get_tag(content));
                                                        post = html_ + post;
                                                }
                                        }
                                        else if ( phase == 'section' ) queue.push(tag.pre + start);
                                        else alert ("encounter error");
                                        myString = post;
					tag=self.get_tag(myString);
                                } else {
					queue.length = 0;
					alert ("Syntax error in " + myString);
	
				}
                        } while ( queue.length > 0 )

                        return myString;
                }

		 this.sectionFiltering=function(myString,tag){


                        var html = '';
                        if ( tag.tag != "section" ) return myString;
                        var post = '';
                        if ( tag.post.length > 0 ) {
                                myString = tag.post;
                                var myRegexp = /(((.|\r|\n)*?)\[\[\s*section(\s+start\s*=\s*(\d+)\s+end\s*=\s*(\d+)\s+step\s*=\s*(\d+)\s+variable\s*=\s*(\w+))*\s*\]\])((.|\r|\n)*)(\[\[\s*\/\s*section\s*\]\])((.|\r|\n)*)/;

                                var match = myRegexp.exec(myString);
            			if ( match != null ) {
		                var pre_=match[2];
				var start_value = parseInt(match[5]);
				var end_value = parseInt(match[6]);
				var step = parseInt(match[7]);
				var variable = match[8];
                                var content=match[9];
                                var end=match[11];
                                post=match[12];
                                var html_ = '';
								
                                for (var i = start_value; i < end_value;   ) {
										var item = {};
										item[variable] = i;
                                        var html__ = self.replace_cool( content, item, '', undefined ,true);
                                        html_ += self.constructContent(html__);
										i = i + step;
                                }
                                html = pre_ + html_;
                        }

                        return tag.pre + html + post;
				}
				else {
					alert ( "syntax error in " + myString );
					return;
				}
        }

		this.constructAssign=function(myString,tag){

			var item = {};
                        do {
								var match = null;
                                if ( tag.post.length > 0 ) {
                                myString = tag.post;
                                        var contentRegexp = /(((.|\r|\n)*?)\[\[\s*assign(\s*variable\s*=\s*([A-Za-z\d]*)\s*value\s*=\s*(.*?))\s*\]\])((.|\r|\n)*)/;
                                        var match = contentRegexp.exec(myString);
										if ( match ){
											var pre_ = match[2];
											var variable = match[5];
											var value = match[6];
											var post = match[7];
											dataArr[variable] = value;
											if ( typeof (pre_) != 'undefined' ) myString = pre_;
											else myString = '';
											myString += post;
										}
										myString = tag.pre + myString;
							tag=self.get_tag(myString);
                                } 
								
                        } while ( match != null )
						
                        return myString;
                }
this.constructValue = function(myString,tag){
                        var item = {};
                        do {
                                                                var match = null;
                                if ( tag.post.length > 0 ) {
                                myString = tag.post;
                                        var contentRegexp = /(((.|\r|\n)*?)\[\[\s*value(\s*variable\s*=\s*([A-Za-z\d_]*)\s*key\s*=\s*([A-Za-z\d_]*)\s*language\s*=\s*([A-Za-z\d_]*))\s*\]\])((.|\r|\n)*)/;
                                        var match = contentRegexp.exec(myString);
                                        var post = '';
                                                                                if ( match ){
                                                                                        var pre_ = match[2];
                                                                                        var variable = match[5];
                                                                                        var key = match[6];
                                                                                        var lang = match[7];
                                                                                        post = match[8];
                                                                                        var html = '';
                                                                                        if ( typeof (pre_) != 'undefined' ) myString = tag.pre + pre_;
                                                                                        else myString = tag.pre + '';
                                                                                        myString += post;
                                                                                        if ( typeof ( jlang[variable] ) != 'undefined' ){
                                                                                                if ( typeof ( jlang[variable][lang]) != 'undefined' ){
                                                                                                        item = jlang[variable][lang];
                                                                                                        myString = self.replace_cool( myString, item, '', undefined,true);
                                                                                                } else alert ( "NO LANG " + lang + " found" );
                                                                                        } else alert ( 'NO array ' + variable +' found' );
                                                                                } else {
                                                                                        myString = tag.pre + myString;
                                                                                }
                                		tag=self.get_tag(myString);
				}

                        } while ( match != null )

                        return myString;
                }
}



