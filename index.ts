window.onload = function () {

    document.getElementById('new-review-form').addEventListener('submit', addReview)

    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    } else {
        loadReviews();
    }
};

function loadReviews() {
    document.getElementById('reviews-list').innerHTML = "";

    let reviews = JSON.parse(localStorage.getItem('reviews')).map(id =>
        renderReview(JSON.parse(localStorage.getItem('review-' + id))));

    document.getElementById('reviews-list').innerHTML = reviews.join('');
}

function renderReview(review) {
    return `
        <div id="review-${review['id']}" class="card col-5 mb-2">
            <div class="card-header">
                <h1>${review['subject']}
                    <button class="btn btn-secondary float-end" onclick="modifyReviewButton(${review['id']})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                        </svg>
                    </button>
                </h1>
                <hr>
                <h3>${review['topic']}</h3>
                <hr>
                <h5>${review['sub-topic']}</h5>
            </div>
            <div class="card-body">
                <b>${review['content']}</b>
            </div>
        </div>
        `
}

function addReview() {
    document.getElementById('create-review-model-submit-btn')["disabled"] = true;

    let review = createReview(<HTMLFormElement>document.getElementById('new-review-form'));

    localStorage.setItem('reviews', JSON.stringify(JSON.parse(localStorage.getItem('reviews')).concat(review.id)));
    localStorage.setItem('review-' + review.id, JSON.stringify(review));

    loadReviews();

    document.getElementById("create-review-model-close-btn").click();
    setTimeout(() => {
        document.getElementById('create-review-model-submit-btn')["disabled"] = false;
    }, 1000)
}

function modifyReviewButton(id: number) {
    let createReviewModelLabel = document.getElementById('create-review-model-label');
    let createReviewModelLabelText = createReviewModelLabel.textContent;

    let previousReview = JSON.parse(localStorage.getItem('review-' + id));
    console.log(previousReview)

    document.getElementById('subject').setAttribute('value', previousReview['subject']);
    document.getElementById('topic').setAttribute('value', previousReview['topic']);
    document.getElementById('sub-topic').setAttribute('value', previousReview['sub-topic']);
    document.getElementById('content').setAttribute('value', previousReview['content']);
    document.getElementById('content').innerText = previousReview['content'];
    document.getElementById('additional-information').innerText = previousReview['additional-information'];
    document.getElementById('resources').innerText = previousReview['resources'];

    let form = <HTMLFormElement>document.getElementById('new-review-form');

    form.removeEventListener('submit', addReview);
    form.onsubmit = function () {
        let review = createReview(form);
        review['id'] = previousReview['id'];
        review['next-attempt'] = previousReview['next-attempt'];
        review['attempts'] = previousReview['attempts'];
        localStorage.setItem('review-' + review.id, JSON.stringify(review));

        form.addEventListener('submit', addReview);
        createReviewModelLabel.textContent = createReviewModelLabelText;

        loadReviews();
    }

    document.getElementById('create-review-modal-btn').click();
}

function createReview(form: HTMLFormElement) {
    let reviews = JSON.parse(localStorage.getItem('reviews'));
    let id = 0;
    if (reviews.length != 0) {
        id = reviews.at(-1) + 1;
    }

    let now = new Date();

    return {
        'id': id,
        'subject': form.elements['subject'].value,
        'topic': form.elements['topic'].value,
        'sub-topic': form.elements['sub-topic'].value,
        'content': form.elements['content'].value,
        'additional-information': form.elements['additional-information'].value,
        'resources': form.elements['resources'].value,
        'created': Date.now(),
        'next-attempt': now.setDate(now.getDate() + 1),
        'attempts': []
    };
}
