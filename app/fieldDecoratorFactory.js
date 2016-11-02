import BeachFieldDecorator from './fieldDecorators/beachFieldDecorator';
import RoomFieldDecorator from './fieldDecorators/roomFieldDecorator';
import _ from 'lodash';

const decorators = {
    beach: BeachFieldDecorator,
    room: RoomFieldDecorator
};

export default class FieldDecoratorFactory {
    static factory (name, field) {
        if (!_.has(decorators, name)) {
            throw new Error(`Decorator "${name}" does not exist`);
        }

        return new decorators[name](field);
    }
}
