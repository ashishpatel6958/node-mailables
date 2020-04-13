const nodemailer = require('nodemailer');

class Mail {
	constructor(credentials = {}) {
		this.mailTo = null;
		this.mailCc = null;
		this.mailBcc = null;
		this.mailFrom = null;
		this.mailSubject = null;
		this.attachment = null;
		this.transporter = null;
		this.stats = null;
		this.transporter = nodemailer.createTransport({
			host: credentials.host,
			port: credentials.port || 587,
			secure: credentials.secure || false, // true for 465, false for other ports
			auth: {
				user: credentials.user,
				pass: credentials.pass,
			},
		});
	}

	/**
	 * Recipient who is going to get mail. it can be
	 * single or multiple. single will comes in string
	 * and multiple will comes in array.
	 *
	 * @param      {(String|Array)}  rcepient
	 * @return     {Mail}
	 */
	to(rcepient) {
		this.mailTo = rcepient;
		return this;
	}
	/**
	 * Recipiants which are going to be in cc
	 *
	 * @param      {(String|Array)}  rcepient
	 * @return     {Mail}
	 */
	cc(rcepient) {
		this.mailCc = rcepient;
		return this;
	}
	/**
	 * Recipants which are going to be in bcc
	 *
	 * @param      {(Array|String)}  rcepient
	 * @return     {Mail}
	 */
	bcc(rcepient) {
		this.mailBcc = rcepient;
		return this;
	}

	/**
	 * From email and name going to display to user
	 *
	 * @param      {String}  email
	 * @param      {String|Null}  [name=null]
	 * @return     {Mail}
	 */
	from(email, name = null) {
		this.mailFrom = name ? `"${name}" ${email}` : email;
		return this;
	}

	/**
	 * If any attachment available
	 *
	 * @param      {Array}  files
	 * @return     {Mail}
	 */
	attachments(files) {
		this.attachment = files;
		return this;
	}

	/**
	 * Mail subject. this subject will be taken from reference
	 * file or we can override it using this function
	 *
	 * @param      {String}  subj
	 * @return     {Mail}
	 */
	subject(subj) {
		this.mailSubject = subj;
		return this;
	}

	linkAttachments(links = []) {}

	/**
	 * Sends mail with HTML attached through reference file
	 *
	 * @param      {Object}   classObject
	 * @return     {Mail}
	 */
	async send(classObject) {
		this.mailFrom = this.mailFrom || classObject.from;
		this.mailSubject = this.mailSubject || classObject.subject;
		let object = this.basicDetails();
		object.html = await classObject.contents();
		if (this.validate(object)) {
			this.stats = await this.transporter.sendMail(object);
			return this;
		}
		throw new Error('Something went wrong while sending mail');
	}

	/**
	 * Sends a raw data in mail.
	 *
	 * @param      {String}   description
	 * @return     {Mail}
	 */
	async sendRaw(description) {
		let object = {};
		let object = this.basicDetails();
		object.text = description;
		if (this.validate(object)) {
			this.stats = await this.transporter.sendMail(object);
			return this;
		}
		throw new Error('Something went wrong while sending mail');
	}

	/**
	 * Resets the object.
	 *
	 * @return     {Mail}
	 */
	reset() {
		this.mailTo = null;
		this.mailCc = null;
		this.mailBcc = null;
		this.mailFrom = null;
		this.mailSubject = null;
		this.attachment = null;
		this.stats = null;
		return this;
	}

	basicDetails() {
		let object = {};
		object.from = this.mailFrom;
		object.to = this.mailTo;
		object.subject = this.mailSubject;
		object.cc = this.mailCc || undefined;
		object.bcc = this.mailBcc || undefined;
		return object;
	}

	validate(details = {}) {
		if (!details.from) {
			throw new Error('Mail from email address is required.');
		} else if (!details.to) {
			throw new Error('Mail to email address is required.');
		} else if (!details.subject) {
			throw new Error('Mail subject is required.');
		} else if (!details.text && !details.html) {
			throw new Error('Mail content is required.');
		}
		return true;
	}
}
module.exports = Mail;
